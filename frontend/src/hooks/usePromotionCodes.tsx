import { useState, useEffect } from 'react';
import apiService from '@/services/api';
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
      const response = await apiService.checkPromotionCode(code);

      if (!response.success) {
        return { isValid: false, message: response.error || 'Mã khuyến mãi không hợp lệ' };
      }

      return { 
        isValid: true, 
        promotion: response.data.promotion,
        message: `Áp dụng thành công: ${response.data.promotion.title}` 
      };

    } catch (error) {
      console.error('Error validating promotion code:', error);
      return { isValid: false, message: 'Lỗi kiểm tra mã khuyến mãi' };
    }
  };

  const generatePromotionCodes = async (promotionId: string, count: number) => {
    setLoading(true);
    try {
      const response = await apiService.generatePromotionCodes(promotionId, count);

      if (response.success) {
        toast({
          title: "Thành công",
          description: `Đã tạo ${count} mã khuyến mãi`,
        });
        return { success: true };
      } else {
        throw new Error(response.error || 'Không thể tạo mã khuyến mãi');
      }
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