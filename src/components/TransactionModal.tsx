import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePromotionCodes } from "@/hooks/usePromotionCodes";
import { BankAccountModal } from "./BankAccountModal";
import { Copy, CreditCard, Upload, Wallet, AlertTriangle, CheckCircle, Tag, Plus } from "lucide-react";

interface Bank {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  qr_code_url: string | null;
}

interface UserBankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_active: boolean;
}


// Cấu hình tài khoản nhận tiền VietQR (cần cập nhật theo thực tế)
const RECEIVER = {
  bankCode: "VCB",
  accountNumber: "1234567890",
  accountName: "TEN CHU TAI KHOAN",
};

const buildVietQRUrl = (amount: number, addInfo: string) => {
  const base = `https://img.vietqr.io/image/${RECEIVER.bankCode}-${RECEIVER.accountNumber}-compact2.png`;
  const params = new URLSearchParams({
    amount: String(Math.max(0, Math.floor(amount || 0))),
    addInfo,
    accountName: RECEIVER.accountName,
  });
  return `${base}?${params.toString()}`;
};

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'deposit' | 'withdrawal';
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, initialTab = 'deposit' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  console.log('TransactionModal props:', { isOpen, initialTab, activeTab });
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userBankAccounts, setUserBankAccounts] = useState<UserBankAccount[]>([]);
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { validatePromotionCode } = usePromotionCodes();

  // Update active tab when initialTab changes or modal opens
  useEffect(() => {
    console.log('useEffect triggered:', { isOpen, initialTab });
    if (isOpen) {
      console.log('Setting activeTab to:', initialTab);
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Update user balance from profile
  useEffect(() => {
    if (profile?.balance) {
      setUserBalance(Number(profile.balance));
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      fetchUserBankAccounts();
    }
  }, [isOpen]);

  // Set up real-time subscription for user's transactions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-transactions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time transaction update for user:', payload);
          
          const transaction = payload.new as any;
          
          // Show notification for transaction status updates
          if (transaction.status === 'approved') {
            toast({
              title: "Giao dịch được duyệt ✅",
              description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                            transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} ${transaction.amount?.toLocaleString()} VND đã được duyệt`,
            });
          } else if (transaction.status === 'rejected') {
            toast({
              title: "Giao dịch bị từ chối ❌",
              description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                            transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} ${transaction.amount?.toLocaleString()} VND bị từ chối`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);


  const fetchUserBankAccounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setUserBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching user bank accounts:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Đã sao chép",
        description: "Thông tin đã được sao chép vào clipboard",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleDepositSubmit = async () => {
    if (!depositAmount || !user) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền nạp",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const transactionData: any = {
        user_id: user.id,
        type: 'deposit',
        amount: parseFloat(depositAmount),
        status: 'pending'
      };


      // Add promotion code to admin note if provided
      if (promotionCode.trim()) {
        transactionData.admin_note = `Mã khuyến mãi: ${promotionCode.trim()}`;
      }

      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin duyệt.",
      });

      setDepositAmount("");
      setPromotionCode("");
      setProofImage(null);
      onClose();
    } catch (error) {
      console.error('Error creating deposit request:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo yêu cầu nạp tiền",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!user || !profile?.username) {
      toast({
        title: "Lỗi",
        description: "Không thể xác định username. Vui lòng đăng nhập lại.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has linked bank account
    if (userBankAccounts.length === 0) {
      toast({
        title: "Cần liên kết ngân hàng",
        description: "Bạn cần liên kết tài khoản ngân hàng trước khi rút tiền",
        variant: "destructive",
      });
      setShowBankAccountModal(true);
      return;
    }

    setLoading(true);
    try {
      console.log('=== FRONTEND: Starting withdrawal process ===');
      console.log('User profile:', profile);
      console.log('User object:', user);
      console.log('User balance:', userBalance);
      
      const username = profile?.username || user?.email?.split('@')[0];
      console.log('Username to be sent:', username);
      
      const requestBody = {
        username: username,
        amount: userBalance
      };
      console.log('Complete request body:', requestBody);

      // Call withdrawal API with timeout
      console.log('=== FRONTEND: About to call withdraw-game-api ===');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      let apiResponse, apiError;
      try {
        const result = await supabase.functions.invoke('withdraw-game-api', {
          body: requestBody,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        apiResponse = result.data;
        apiError = result.error;
      } catch (error: any) {
        console.error('Function invocation failed:', error);
        apiError = { message: error.message || 'Network error' };
      } finally {
        clearTimeout(timeoutId);
      }

      console.log('=== FRONTEND: API Response received ===');
      console.log('API Response:', apiResponse);
      console.log('API Error:', apiError);

      if (apiError) {
        console.error('Withdrawal API error:', apiError);
        toast({
          title: "Lỗi API",
          description: `Lỗi gọi API: ${apiError.message || 'Không có phản hồi từ server'}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Withdrawal API response:', apiResponse);

      if (apiResponse.success) {
        toast({
          title: "Rút tiền thành công ✅",
          description: `Đã rút ${apiResponse.amount?.toLocaleString()} VND thành công`,
        });

        onClose();
      } else {
        throw new Error(apiResponse.message || 'Withdrawal failed');
      }

    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Lỗi rút tiền",
        description: "Không thể thực hiện rút tiền. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankAccountSuccess = () => {
    fetchUserBankAccounts();
    toast({
      title: "Thành công",
      description: "Tài khoản ngân hàng đã được liên kết. Bạn có thể rút tiền ngay bây giờ.",
    });
  };

  // Real-time validation for withdrawal amount
  const withdrawalValidation = useMemo(() => {
    if (!withdrawAmount) return null;
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      return { type: 'error', message: 'Vui lòng nhập số tiền hợp lệ' };
    }
    
    if (amount > userBalance) {
      return { 
        type: 'error', 
        message: `Số dư không đủ. Số dư hiện tại: ${userBalance.toLocaleString()} VND` 
      };
    }
    
    if (amount === userBalance) {
      return { 
        type: 'warning', 
        message: 'Bạn đang rút toàn bộ số dư' 
      };
    }
    
    return { 
      type: 'success', 
      message: `Số dư sau khi rút: ${(userBalance - amount).toLocaleString()} VND` 
    };
  }, [withdrawAmount, userBalance]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in animate-scale-in">
        <div className="animate-fade-in-up">{/* Content wrapper for additional animation */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center animate-fade-in delay-100">
            Giao dịch tài khoản
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground animate-fade-in delay-150">
            Thực hiện giao dịch nạp tiền hoặc rút tiền cho tài khoản của bạn
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'deposit' | 'withdrawal')} className="w-full animate-fade-in delay-200">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Nạp tiền
            </TabsTrigger>
            <TabsTrigger value="withdrawal" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Rút tiền
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nạp tiền vào tài khoản</CardTitle>
                <CardDescription>
                  Chuyển khoản theo thông tin bên dưới và gửi yêu cầu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* VietQR dynamic section */}
                <div className="space-y-3">
                  <div className="text-center">
                    <Label className="text-sm font-medium">QR Code chuyển khoản</Label>
                    <div className="mt-2">
                      <img
                        src={buildVietQRUrl(parseFloat(depositAmount) || 0, `NAP ${profile?.username || user?.email?.split("@")[0] || "USER"}`)}
                        alt="QR Nạp tiền VietQR"
                        className="w-32 h-32 md:w-48 md:h-48 mx-auto border rounded-lg shadow-sm"
                        loading="lazy"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Nội dung chuyển khoản: {`NAP ${profile?.username || user?.email?.split("@")[0] || "USER"}`}
                      </p>
                    </div>
                  </div>

                  {/* Bank Information Section */}
                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-center block">Thông tin chuyển khoản</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Mã ngân hàng</Label>
                        <div className="flex items-center justify-between p-2 bg-background rounded border">
                          <span className="font-medium">{RECEIVER.bankCode}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(RECEIVER.bankCode)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Số tài khoản</Label>
                        <div className="flex items-center justify-between p-2 bg-background rounded border">
                          <span className="font-medium text-lg">{RECEIVER.accountNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(RECEIVER.accountNumber)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Chủ tài khoản</Label>
                        <div className="flex items-center justify-between p-2 bg-background rounded border">
                          <span className="font-medium">{RECEIVER.accountName}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(RECEIVER.accountName)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Số tiền nạp (VND)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="Nhập số tiền"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promotion-code" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Mã khuyến mãi (tùy chọn)
                  </Label>
                  <Input
                    id="promotion-code"
                    type="text"
                    placeholder="Nhập mã khuyến mãi nếu có"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                  />
                  {promotionCode && (
                    <p className="text-xs text-muted-foreground">
                      Mã khuyến mãi sẽ được áp dụng khi admin duyệt giao dịch
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleDepositSubmit}
                  disabled={loading || !depositAmount}
                  className="w-full"
                >
                  {loading ? "Đang xử lý..." : "Gửi yêu cầu nạp tiền"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rút tiền từ tài khoản</CardTitle>
                <CardDescription>
                  Yêu cầu rút tiền về tài khoản ngân hàng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Balance Display */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Số dư hiện tại:</span>
                    <span className="font-bold text-lg text-blue-900">
                      {userBalance.toLocaleString()} VND
                    </span>
                  </div>
                </div>

                {/* Bank Account Section */}
                <div className="space-y-3">
                  <Label>Tài khoản ngân hàng</Label>
                  {userBankAccounts.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        Bạn cần liên kết tài khoản ngân hàng để rút tiền
                      </p>
                      <Button 
                        onClick={() => setShowBankAccountModal(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Liên kết tài khoản ngân hàng
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userBankAccounts.map((account) => (
                        <div key={account.id} className="p-3 border rounded-lg bg-green-50 border-green-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-green-800">{account.bank_name}</p>
                              <p className="text-sm text-green-600">
                                {account.account_number} - {account.account_holder}
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          </div>
                        </div>
                      ))}
                      <Button 
                        onClick={() => setShowBankAccountModal(true)}
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Thêm tài khoản ngân hàng khác
                      </Button>
                    </div>
                  )}
                </div>

                {userBankAccounts.length > 0 && (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Rút toàn bộ số dư:</strong> Hệ thống sẽ tự động rút toàn bộ {userBalance.toLocaleString()} VND về tài khoản ngân hàng đã liên kết.
                      </p>
                    </div>

                    <Button 
                      onClick={handleWithdrawSubmit}
                      disabled={loading || userBalance <= 0}
                      className="w-full"
                    >
                      {loading ? "Đang xử lý..." : `Rút ${userBalance.toLocaleString()} VND`}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <BankAccountModal 
          isOpen={showBankAccountModal}
          onClose={() => setShowBankAccountModal(false)}
          onSuccess={handleBankAccountSuccess}
        />
        </div>{/* End content wrapper */}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;