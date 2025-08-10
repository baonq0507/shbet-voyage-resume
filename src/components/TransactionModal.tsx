import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePromotions } from "@/hooks/usePromotions";
import { usePromotionCodes } from "@/hooks/usePromotionCodes";
import { BankAccountModal } from "./BankAccountModal";
import { Copy, CreditCard, Upload, Wallet, AlertTriangle, CheckCircle, Tag, Plus } from "lucide-react";
import QRCode from "qrcode";

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

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'deposit' | 'withdrawal';
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, initialTab = 'deposit' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  console.log('TransactionModal props:', { isOpen, initialTab, activeTab });
  const [banks, setBanks] = useState<Bank[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [availablePromotion, setAvailablePromotion] = useState<any>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userBankAccounts, setUserBankAccounts] = useState<UserBankAccount[]>([]);
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { validatePromotionCode } = usePromotionCodes();
  const { getActivePromotions, getLatestPromotion } = usePromotions();

  // New deposit flow state
  const [depositStep, setDepositStep] = useState<'method' | 'amount' | 'bank' | 'qr'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'vietqr' | null>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{
    transactionId?: string;
    orderCode?: string | number;
    description?: string;
    amount?: number;
    originalAmount?: number;
    bonusAmount?: number;
    paymentUrl?: string;
    qrCode?: string;
  } | null>(null);
  const [txStatus, setTxStatus] = useState<'awaiting_payment' | 'pending' | 'approved' | 'rejected' | null>(null);
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string | null>(null);

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

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('bank')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Reset deposit flow each time modal opens
      setDepositStep('method');
      setSelectedMethod(null);
      setSelectedBank(null);
      setOrderInfo(null);
      setTxStatus(null);
      setQrCodeImageUrl(null);
      setDepositAmount("");
      setPromotionCode("");
      setAvailablePromotion(null);
      fetchUserBankAccounts();
      fetchBanks();
    }
  }, [isOpen]);

  // Separate effect to handle promotions loading
  useEffect(() => {
    if (isOpen) {
      try {
        // Check for available promotions after they're loaded
        const activePromotions = getActivePromotions();
        console.log('Available promotions:', activePromotions);
        if (activePromotions.length > 0) {
          setAvailablePromotion(activePromotions[0]);
          console.log('Set available promotion:', activePromotions[0]);
        }
      } catch (error) {
        console.error('Error loading promotions:', error);
      }
    }
  }, [isOpen, getActivePromotions]);

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
          
          // Check if this is the current transaction being processed
          const isCurrentTransaction = orderInfo?.transactionId === transaction.id;
          
          if (isCurrentTransaction) {
            // Update transaction status for current order
            setTxStatus(transaction.status);
            
            // Update status to show successful completion
            if (transaction.status === 'approved') {
              setTxStatus('approved');
            }
          }
          
          // Show notification for transaction status updates
          if (transaction.status === 'approved') {
            toast({
              title: "Giao dịch được duyệt ✅",
              description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                            transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} ${transaction.amount?.toLocaleString()} VND đã được duyệt`,
            });
            
            // Auto-close modal after successful deposit
            if (isCurrentTransaction && transaction.type === 'deposit') {
              setTimeout(() => {
                onClose();
                // Reset deposit flow
                setDepositStep('method');
                setSelectedMethod(null);
                setSelectedBank(null);
                setOrderInfo(null);
                setTxStatus(null);
                setQrCodeImageUrl(null);
                setDepositAmount("");
                setPromotionCode("");
              }, 3000); // Close after 3 seconds to let user see the success message
            }
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
  }, [user, toast, orderInfo?.transactionId, onClose]);

  // Legacy bank fetch removed in new flow

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

  const handleCreateDepositOrder = async () => {
    console.log("handleCreateDepositOrder called with:", { depositAmount, user: !!user });
    
    if (!depositAmount || !user) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập số tiền nạp', variant: 'destructive' });
      return;
    }

    setCreatingOrder(true);
    try {
      const amount = parseFloat(depositAmount);
      console.log("Parsed amount:", amount);
      
      if (!amount || amount <= 0) {
        throw new Error('Vui lòng nhập số tiền hợp lệ');
      }

      const requestBody = {
        amount,
        promotionCode: promotionCode?.trim() || undefined,
      };
      
      console.log("Request body to send:", requestBody);

      const response = await fetch('https://hlydtwqhiuwbikkjemck.supabase.co/functions/v1/create-deposit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseWR0d3FoaXV3Ymlra2plbWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTA1MjQsImV4cCI6MjA2OTgyNjUyNH0.deIb21DJNmyM5ZjocFAl4j_47AF6CnY26LN0Bn9eB9k'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      console.log("Edge function response:", { data });

      if (!data) throw new Error('Không nhận được dữ liệu từ máy chủ');

      // Promotion will be applied only after successful PayOS payment confirmation

      setOrderInfo({
        transactionId: data.transactionId,
        orderCode: data.orderCode,
        description: data.description,
        paymentUrl: data.paymentUrl,
        qrCode: data.qrCode,
        amount: amount,
        originalAmount: amount,
        bonusAmount: 0, // Will be updated after payment confirmation
      });
      setTxStatus('awaiting_payment');
      setDepositStep('qr');
    } catch (err) {
      console.error('Error creating deposit order:', err);
      toast({ title: 'Lỗi', description: 'Không thể tạo đơn nạp tiền', variant: 'destructive' });
    } finally {
      setCreatingOrder(false);
    }
  };

  // Poll transaction status when showing QR
  useEffect(() => {
    let interval: number | undefined;
    if (depositStep === 'qr' && orderInfo?.transactionId) {
      interval = window.setInterval(async () => {
        const { data } = await supabase
          .from('transactions')
          .select('status')
          .eq('id', orderInfo.transactionId)
          .maybeSingle();
        if (data?.status) {
          setTxStatus(data.status as any);
          if (data.status === 'approved' || data.status === 'rejected') {
            window.clearInterval(interval);
          }
        }
      }, 5000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [depositStep, orderInfo?.transactionId]);

  // Generate QR code image when qrCode string is available
  useEffect(() => {
    const generateQRImage = async () => {
      if (orderInfo?.qrCode && typeof orderInfo.qrCode === 'string') {
        try {
          // Generate QR code image from VietQR string
          const qrImageUrl = await QRCode.toDataURL(orderInfo.qrCode, {
            errorCorrectionLevel: 'M',
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            width: 256
          });
          setQrCodeImageUrl(qrImageUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
          // Fallback to display the QR string as text if image generation fails
          setQrCodeImageUrl(null);
        }
      } else {
        setQrCodeImageUrl(null);
      }
    };

    generateQRImage();
  }, [orderInfo?.qrCode]);

  // Auto close modal when payment is successful
  useEffect(() => {
    if (txStatus === 'approved') {
      toast({
        title: "Nạp tiền thành công ✅",
        description: `Đã nạp ${(orderInfo?.amount || 0).toLocaleString()} VND thành công`,
      });
      
      // Auto close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [txStatus, orderInfo?.amount, toast, onClose]);

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
                  Chọn phương thức nạp, nhập số tiền và quét VietQR để thanh toán
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {depositStep === 'method' && (
                  <div className="space-y-4">
                    <Label className="text-sm">Phương thức nạp tiền</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('vietqr')}
                        className={`p-4 rounded-lg border text-left transition ${selectedMethod === 'vietqr' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Chuyển khoản VietQR (PayOS)</p>
                            <p className="text-sm text-muted-foreground">Quét mã VietQR, hệ thống tự động cộng tiền khi thanh toán thành công</p>
                          </div>
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                      </button>
                    </div>
                    <Button
                      className="w-full"
                      disabled={!selectedMethod}
                      onClick={() => setDepositStep('amount')}
                    >
                      Tiếp tục
                    </Button>
                  </div>
                )}

                {depositStep === 'amount' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Số tiền nạp (VND)</Label>
                      <Input
                        type="number"
                        placeholder="Nhập số tiền"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[100000, 200000, 500000, 1000000, 2000000, 5000000].map(v => (
                        <Button key={v} variant="outline" onClick={() => setDepositAmount(String(v))}>
                          {v.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Mã khuyến mãi (tùy chọn)
                      </Label>
                      <Input
                        type="text"
                        placeholder="Nhập mã khuyến mãi nếu có"
                        value={promotionCode}
                        onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                      />
                    </div>
                    
                    {/* Display available promotion */}
                    {availablePromotion && (
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Khuyến mãi có sẵn</span>
                        </div>
                        <p className="text-sm text-yellow-700 mb-2">{availablePromotion.title || 'Khuyến mãi'}</p>
                        {availablePromotion.description && (
                          <p className="text-xs text-yellow-600 mb-2">{availablePromotion.description}</p>
                        )}
                        <div className="text-sm font-medium text-orange-700">
                          {availablePromotion.bonus_percentage 
                            ? `Tặng ${availablePromotion.bonus_percentage}% số tiền nạp`
                            : availablePromotion.bonus_amount 
                            ? `Tặng ${Number(availablePromotion.bonus_amount).toLocaleString()} VND`
                            : 'Khuyến mãi đặc biệt'
                          }
                        </div>
                        {depositAmount && Number(depositAmount) > 0 && (
                          <div className="mt-2 p-2 bg-white/50 rounded border">
                            <div className="text-xs text-gray-600">Dự kiến nhận được:</div>
                            <div className="font-bold text-green-700">
                              {(() => {
                                try {
                                  const amount = parseFloat(depositAmount) || 0;
                                  const bonus = availablePromotion.bonus_percentage 
                                    ? amount * (Number(availablePromotion.bonus_percentage) / 100)
                                    : Number(availablePromotion.bonus_amount) || 0;
                                  return `${amount.toLocaleString()} + ${bonus.toLocaleString()} = ${(amount + bonus).toLocaleString()} VND`;
                                } catch (error) {
                                  console.error('Error calculating bonus:', error);
                                  return 'Không thể tính toán bonus';
                                }
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setDepositStep('method')}>Quay lại</Button>
                      <Button className="flex-1" onClick={() => setDepositStep('bank')} disabled={!depositAmount}>
                        Tiếp tục
                      </Button>
                    </div>
                  </div>
                )}

                {depositStep === 'bank' && (
                  <div className="space-y-4">
                    <Label className="text-sm">Chọn ngân hàng nhận tiền</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {banks.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-4 rounded-lg border text-left transition ${selectedBank?.id === bank.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{bank.bank_name}</p>
                              <p className="text-sm text-muted-foreground">{bank.account_number} - {bank.account_holder}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setDepositStep('amount')}>Quay lại</Button>
                      <Button className="flex-1" onClick={handleCreateDepositOrder} disabled={creatingOrder || !selectedBank}>
                        {creatingOrder ? 'Đang tạo đơn...' : 'Tạo đơn nạp tiền'}
                      </Button>
                    </div>
                  </div>
                )}

                {depositStep === 'qr' && (
                  <div className="space-y-4">
                    {orderInfo?.paymentUrl ? (
                      <div className="text-center space-y-4">
                        <Label className="text-sm font-medium">Thanh toán qua PayOS</Label>
                        
                         {qrCodeImageUrl ? (
                           <div className="space-y-3">
                             <img
                               src={qrCodeImageUrl}
                               alt="VietQR Code"
                               className="w-48 h-48 md:w-56 md:h-56 mx-auto border rounded-lg shadow-sm"
                             />
                             <p className="text-xs text-muted-foreground">Quét mã QR để thanh toán</p>
                           </div>
                         ) : orderInfo.qrCode ? (
                           <div className="space-y-3">
                             <div className="w-48 h-48 md:w-56 md:h-56 mx-auto border rounded-lg shadow-sm bg-gray-100 flex items-center justify-center">
                               <p className="text-sm text-gray-500">Đang tạo mã QR...</p>
                             </div>
                             <p className="text-xs text-muted-foreground">Quét mã QR để thanh toán</p>
                           </div>
                         ) : null}
                        
                         <div className="space-y-3">
                          
                          <div className="space-y-2 bg-muted/50 p-3 rounded-lg text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Mã đơn hàng</span>
                              <span className="font-medium">{orderInfo.orderCode}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Số tiền</span>
                              <span className="font-bold">{(orderInfo.amount || 0).toLocaleString()} VND</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Nội dung</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate max-w-[180px]" title={orderInfo.description}>{orderInfo.description}</span>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(orderInfo.description || '')}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                         <div className="text-sm">
                           Trạng thái: {txStatus === 'approved' ? (
                             <span className="text-green-600 font-medium">✅ Thanh toán thành công</span>
                           ) : txStatus === 'rejected' ? (
                             <span className="text-red-600 font-medium">❌ Thanh toán thất bại</span>
                           ) : txStatus === 'pending' ? (
                             <div className="flex items-center gap-2 text-blue-600 font-medium">
                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                               <span>🔄 Đang cập nhật số dư...</span>
                             </div>
                           ) : txStatus === 'awaiting_payment' ? (
                             <span className="text-orange-600 font-medium">⏳ Chờ thanh toán</span>
                           ) : (
                             <span className="text-blue-600 font-medium">🔄 Đang xử lý...</span>
                           )}
                         </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setDepositStep('bank')}>Quay lại</Button>
                          <Button className="flex-1" onClick={onClose} disabled={txStatus !== 'approved'}>
                            {txStatus === 'approved' ? 'Hoàn tất' : 'Đóng'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            PayOS chưa được cấu hình hoặc có lỗi khi tạo link thanh toán. Vui lòng liên hệ hỗ trợ.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2 bg-muted/50 p-3 rounded-lg text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Mã đơn hàng</span>
                            <span className="font-medium">{orderInfo?.orderCode}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Số tiền</span>
                            <span className="font-bold">{(orderInfo?.amount || 0).toLocaleString()} VND</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full" onClick={() => setDepositStep('bank')}>
                          Quay lại
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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