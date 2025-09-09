import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BankAccountModal = ({ isOpen, onClose, onSuccess }: BankAccountModalProps) => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để liên kết tài khoản ngân hàng",
        variant: "destructive",
      });
      return;
    }

    if (!bankName || !accountNumber || !accountHolder) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('user_bank_accounts')
        .insert({
          user_id: user.id,
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Tài khoản ngân hàng đã được liên kết thành công",
      });

      // Reset form
      setBankName("");
      setAccountNumber("");
      setAccountHolder("");
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error linking bank account:', error);
      toast({
        title: "Lỗi",
        description: "Không thể liên kết tài khoản ngân hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] animate-fade-in animate-scale-in">
        <div className="animate-fade-in-up">{/* Content wrapper for additional animation */}
        <DialogHeader>
          <DialogTitle className="animate-fade-in delay-100">Liên kết tài khoản ngân hàng</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in delay-200">
          <div className="space-y-2">
            <Label htmlFor="bankName">Tên ngân hàng</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Vietcombank, Techcombank, BIDV..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Số tài khoản</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountHolder">Chủ tài khoản</Label>
            <Input
              id="accountHolder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Tên chủ tài khoản"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Liên kết"}
            </Button>
          </div>
        </form>
        </div>{/* End content wrapper */}
      </DialogContent>
    </Dialog>
  );
};