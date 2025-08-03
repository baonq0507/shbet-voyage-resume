import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Copy, CreditCard, Upload, Wallet } from "lucide-react";

interface Bank {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  qr_code_url: string | null;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchBanks();
    }
  }, [isOpen]);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('bank')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setBanks(data || []);
      if (data && data.length > 0) {
        setSelectedBank(data[0]);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin ngân hàng",
        variant: "destructive",
      });
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
    if (!selectedBank || !depositAmount || !user) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'deposit',
            amount: parseFloat(depositAmount),
            bank_id: selectedBank.id,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin duyệt.",
      });

      setDepositAmount("");
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
    if (!withdrawAmount || !user) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền rút",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'withdrawal',
            amount: parseFloat(withdrawAmount),
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Yêu cầu rút tiền đã được gửi. Vui lòng chờ admin duyệt.",
      });

      setWithdrawAmount("");
      onClose();
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo yêu cầu rút tiền",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Giao dịch tài khoản
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Nạp tiền
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
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
                <div className="space-y-2">
                  <Label htmlFor="bank-select">Chọn ngân hàng</Label>
                  <Select 
                    value={selectedBank?.id || ""}
                    onValueChange={(value) => {
                      const bank = banks.find(b => b.id === value);
                      setSelectedBank(bank || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngân hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.bank_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBank && (
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-4">
                      {/* QR Code Section */}
                      <div className="text-center">
                        <Label className="text-sm font-medium">QR Code chuyển khoản</Label>
                        {selectedBank.qr_code_url && (
                          <div className="mt-2">
                            <img 
                              src={selectedBank.qr_code_url} 
                              alt="QR Code" 
                              className="w-32 h-32 md:w-48 md:h-48 mx-auto border rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Bank Information Section */}
                      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                        <Label className="text-sm font-medium text-center block">Thông tin chuyển khoản</Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Ngân hàng</Label>
                            <div className="flex items-center justify-between p-2 bg-background rounded border">
                              <span className="font-medium">{selectedBank.bank_name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(selectedBank.bank_name)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Số tài khoản</Label>
                            <div className="flex items-center justify-between p-2 bg-background rounded border">
                              <span className="font-medium text-lg">{selectedBank.account_number}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(selectedBank.account_number)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Chủ tài khoản</Label>
                            <div className="flex items-center justify-between p-2 bg-background rounded border">
                              <span className="font-medium">{selectedBank.account_holder}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(selectedBank.account_holder)}
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

                    <Button 
                      onClick={handleDepositSubmit}
                      disabled={loading || !depositAmount}
                      className="w-full"
                    >
                      {loading ? "Đang xử lý..." : "Gửi yêu cầu nạp tiền"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rút tiền từ tài khoản</CardTitle>
                <CardDescription>
                  Yêu cầu rút tiền về tài khoản ngân hàng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Số tiền rút (VND)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Nhập số tiền"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Yêu cầu rút tiền sẽ được xử lý trong vòng 24 giờ. 
                    Vui lòng đảm bảo thông tin tài khoản ngân hàng của bạn đã được cập nhật.
                  </p>
                </div>

                <Button 
                  onClick={handleWithdrawSubmit}
                  disabled={loading || !withdrawAmount}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? "Đang xử lý..." : "Yêu cầu rút tiền"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;