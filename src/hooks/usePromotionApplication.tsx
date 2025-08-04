import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  min_deposit?: number;
  max_uses?: number;
  current_uses: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const usePromotionApplication = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const applyPromotionToDeposit = async (
    userId: string, 
    depositAmount: number, 
    adminUserId?: string
  ) => {
    setLoading(true);
    try {
      // Fetch active promotions
      const { data: promotions, error: promotionError } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (promotionError) throw promotionError;

      // Find applicable promotion
      const applicablePromotion = promotions?.find((promo: Promotion) => {
        // Check if promotion has remaining uses
        const hasRemainingUses = !promo.max_uses || promo.current_uses < promo.max_uses;
        
        // Check if deposit meets minimum requirement
        const meetsMinDeposit = !promo.min_deposit || depositAmount >= (promo.min_deposit || 0);
        
        return hasRemainingUses && meetsMinDeposit;
      });

      if (!applicablePromotion) {
        return { success: true, bonusAmount: 0, promotion: null };
      }

      // Calculate bonus amount
      let bonusAmount = 0;
      if (applicablePromotion.discount_percentage) {
        bonusAmount = (depositAmount * applicablePromotion.discount_percentage) / 100;
      } else if (applicablePromotion.discount_amount) {
        bonusAmount = applicablePromotion.discount_amount;
      }

      if (bonusAmount <= 0) {
        return { success: true, bonusAmount: 0, promotion: null };
      }

      // Get current user balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Add bonus to user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: (profile?.balance || 0) + bonusAmount
        })
        .eq('user_id', userId);

      if (balanceError) throw balanceError;

      // Create bonus transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'bonus',
          amount: bonusAmount,
          status: 'approved',
          admin_note: `Khuyến mãi "${applicablePromotion.title}" - ${
            applicablePromotion.discount_percentage 
              ? `${applicablePromotion.discount_percentage}%` 
              : `${applicablePromotion.discount_amount?.toLocaleString()} VND`
          }`,
          approved_by: adminUserId,
          approved_at: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      // Update promotion usage count
      const { error: promotionUpdateError } = await supabase
        .from('promotions')
        .update({
          current_uses: applicablePromotion.current_uses + 1
        })
        .eq('id', applicablePromotion.id);

      if (promotionUpdateError) throw promotionUpdateError;

      toast({
        title: "Khuyến mãi đã được áp dụng! 🎉",
        description: `Bạn nhận được bonus ${bonusAmount.toLocaleString()} VND từ khuyến mãi "${applicablePromotion.title}"`,
      });

      return { 
        success: true, 
        bonusAmount, 
        promotion: applicablePromotion 
      };

    } catch (error) {
      console.error('Error applying promotion:', error);
      toast({
        title: "Lỗi áp dụng khuyến mãi",
        description: "Không thể áp dụng khuyến mãi, nhưng giao dịch nạp tiền vẫn thành công",
        variant: "destructive",
      });
      return { success: false, bonusAmount: 0, promotion: null };
    } finally {
      setLoading(false);
    }
  };

  return {
    applyPromotionToDeposit,
    loading
  };
};