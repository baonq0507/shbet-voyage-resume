import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Coins, DollarSign } from 'lucide-react';

interface PointExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PointExchangeModal = ({ open, onOpenChange, onSuccess }: PointExchangeModalProps) => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate points (1000đ = 1 point)
  const points = amount ? Math.floor(Number(amount) / 1000) : 0;
  const validAmount = Number(amount) >= 1000 && Number(amount) <= (profile?.balance || 0);

  const handleSubmit = async () => {
    if (!profile || !validAmount) return;

    setLoading(true);
    try {
      // Call deposit-game-api function
      const { data, error } = await supabase.functions.invoke('deposit-game-api', {
        body: {
          username: profile.username,
          amount: Number(amount)
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Update user balance locally (subtract the converted amount)
        const newBalance = profile.balance - Number(amount);
        
        // Refresh profile to get updated balance from server
        await refreshProfile();
        
        toast({
          title: "Đổi điểm thành công!",
          description: `Đã đổi ${amount.toLocaleString()}đ thành ${points} điểm game`,
        });

        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error(data?.message || 'Đổi điểm thất bại');
      }
    } catch (error: any) {
      console.error('Point exchange error:', error);
      toast({
        title: "Lỗi đổi điểm",
        description: error.message || "Không thể đổi điểm, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            Đổi điểm game
          </DialogTitle>
          <DialogDescription>
            Chuyển đổi số dư thành điểm để chơi game. Tỷ lệ: 1.000đ = 1 điểm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Balance */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Số dư hiện tại:</span>
            <div className="flex items-center gap-1 text-lg font-bold text-green-600">
              <DollarSign className="w-4 h-4" />
              {profile?.balance?.toLocaleString() || 0}đ
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền muốn đổi (tối thiểu 1.000đ)</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Nhập số tiền..."
              className="text-lg"
            />
            {amount && !validAmount && Number(amount) < 1000 && (
              <p className="text-sm text-destructive">Số tiền tối thiểu là 1.000đ</p>
            )}
            {amount && Number(amount) > (profile?.balance || 0) && (
              <p className="text-sm text-destructive">Số dư không đủ</p>
            )}
          </div>

          {/* Points Preview */}
          {amount && points > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-sm font-medium">Điểm nhận được:</span>
              <div className="flex items-center gap-1 text-lg font-bold text-yellow-600">
                <Coins className="w-4 h-4" />
                {points} điểm
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!validAmount || loading}
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Đổi điểm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PointExchangeModal;