import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PromotionCode {
  id: string;
  promotion_id: string;
  code: string;
  used_by?: string;
  used_at?: string;
  is_used: boolean;
  created_at: string;
}

export const usePromotionCodes = () => {
  const [codes, setCodes] = useState<PromotionCode[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validatePromotionCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('promotion_codes')
        .select(`
          *,
          promotions (
            id,
            title,
            promotion_type,
            bonus_percentage,
            bonus_amount,
            min_deposit,
            max_uses,
            current_uses,
            start_date,
            end_date,
            is_active
          )
        `)
        .eq('code', code)
        .eq('is_used', false)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { isValid: false, message: 'Mã khuyến mãi không tồn tại hoặc đã được sử dụng' };
        }
        throw error;
      }

      const promotion = (data as any).promotions;
      
      // Check if promotion is active and within date range
      const now = new Date();
      if (!promotion.is_active) {
        return { isValid: false, message: 'Khuyến mãi không còn hoạt động' };
      }
      
      if (new Date(promotion.start_date) > now) {
        return { isValid: false, message: 'Khuyến mãi chưa bắt đầu' };
      }
      
      if (new Date(promotion.end_date) < now) {
        return { isValid: false, message: 'Khuyến mãi đã hết hạn' };
      }
      
      // Check if promotion has remaining uses
      if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
        return { isValid: false, message: 'Khuyến mãi đã hết lượt sử dụng' };
      }

      return { 
        isValid: true, 
        promotion,
        message: `Áp dụng thành công: ${promotion.title}` 
      };

    } catch (error) {
      console.error('Error validating promotion code:', error);
      return { isValid: false, message: 'Lỗi kiểm tra mã khuyến mãi' };
    }
  };

  const generatePromotionCodes = async (promotionId: string, count: number) => {
    setLoading(true);
    try {
      const codes = [];
      for (let i = 0; i < count; i++) {
        const code = `PROMO${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        codes.push({
          promotion_id: promotionId,
          code: code
        });
      }

      const { error } = await supabase
        .from('promotion_codes')
        .insert(codes);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã tạo ${count} mã khuyến mãi`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error generating promotion codes:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo mã khuyến mãi",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    codes,
    loading,
    validatePromotionCode,
    generatePromotionCodes
  };
};