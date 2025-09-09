import { useState } from 'react';
import apiService from '@/services/api';
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
      // Use API service to apply promotion
      const response = await apiService.applyPromotionCode(promotionCode || '', depositAmount);

      if (!response.success) {
        return { success: true, bonusAmount: 0, promotion: null };
      }

      const bonusAmount = response.data.bonusAmount;
      const promotion = response.data.promotion;

      if (bonusAmount > 0) {
        toast({
          title: "Khuyến mãi đã được áp dụng! 🎉",
          description: `Bạn nhận được bonus ${bonusAmount.toLocaleString()} VND từ khuyến mãi "${promotion.title}"`,
        });
      }

      return { 
        success: true, 
        bonusAmount, 
        promotion 
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