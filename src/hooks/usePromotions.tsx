import { useState, useEffect } from 'react';
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

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPromotions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions((data || []) as Promotion[]);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const getLatestPromotion = () => {
    return promotions.length > 0 ? promotions[0] : null;
  };

  const getActivePromotions = () => {
    const now = new Date();
    return promotions.filter(promo => {
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      
      return promo.is_active && 
        startDate <= now && 
        endDate >= now &&
        (!promo.max_uses || promo.current_uses < promo.max_uses);
    });
  };

  return {
    promotions,
    loading,
    getLatestPromotion,
    getActivePromotions,
    refetch: fetchPromotions
  };
};