import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  promotion_type: 'first_deposit' | 'time_based' | 'code_based';
  bonus_percentage?: number;
  bonus_amount?: number;
  min_deposit?: number;
  max_uses?: number;
  current_uses: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  promotion_code?: string;
  is_first_deposit_only: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const usePromotionApplication = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const applyPromotionToDeposit = async (
    userId: string, 
    depositAmount: number, 
    adminUserId?: string,
    promotionCode?: string
  ) => {
    setLoading(true);
    try {
      // Check if this is user's first deposit
      const { data: isFirstDepositResult, error: firstDepositError } = await supabase
        .rpc('is_first_deposit', { user_id_param: userId });

      if (firstDepositError) throw firstDepositError;
      const isFirstDeposit = isFirstDepositResult;

      // Fetch active promotions based on type and conditions
      const { data: promotions, error: promotionError } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (promotionError) throw promotionError;

      // Find applicable promotion based on type
      let applicablePromotion = null;

      if (promotionCode) {
        // If promotion code provided, find code-based promotion
        applicablePromotion = promotions?.find((promo: any) => {
          return promo.promotion_type === 'code_based' && 
                 promo.promotion_code === promotionCode &&
                 (!promo.max_uses || promo.current_uses < promo.max_uses) &&
                 (!promo.min_deposit || depositAmount >= (promo.min_deposit || 0));
        }) as Promotion || null;
      } else {
        // Find automatic promotions (first_deposit or time_based)
        for (const promo of (promotions as any[]) || []) {
          const hasRemainingUses = !promo.max_uses || promo.current_uses < promo.max_uses;
          const meetsMinDeposit = !promo.min_deposit || depositAmount >= (promo.min_deposit || 0);
          
          if (!hasRemainingUses || !meetsMinDeposit) continue;
          
          // Check promotion type conditions
          if (promo.promotion_type === 'first_deposit' && isFirstDeposit) {
            applicablePromotion = promo;
            break;
          } else if (promo.promotion_type === 'time_based' && !promo.is_first_deposit_only) {
            applicablePromotion = promo;
            break;
          } else if (promo.promotion_type === 'time_based' && promo.is_first_deposit_only && isFirstDeposit) {
            applicablePromotion = promo;
            break;
          }
        }
      }

      if (!applicablePromotion) {
        return { success: true, bonusAmount: 0, promotion: null };
      }

      // Calculate bonus amount
      let bonusAmount = 0;
      if (applicablePromotion.bonus_percentage) {
        bonusAmount = (depositAmount * applicablePromotion.bonus_percentage) / 100;
      } else if (applicablePromotion.bonus_amount) {
        bonusAmount = applicablePromotion.bonus_amount;
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
            applicablePromotion.bonus_percentage 
              ? `${applicablePromotion.bonus_percentage}%` 
              : `${applicablePromotion.bonus_amount?.toLocaleString()} VND`
          } ${applicablePromotion.promotion_type === 'first_deposit' ? '(Nạp đầu)' : 
              applicablePromotion.promotion_type === 'code_based' ? `(Mã: ${promotionCode})` : ''}`,
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

      // If promotion code was used, mark it as used
      if (promotionCode && applicablePromotion.promotion_type === 'code_based') {
        const { error: codeUpdateError } = await supabase
          .from('promotion_codes')
          .update({
            is_used: true,
            used_by: userId,
            used_at: new Date().toISOString()
          })
          .eq('code', promotionCode)
          .eq('promotion_id', applicablePromotion.id);

        if (codeUpdateError) throw codeUpdateError;
      }

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