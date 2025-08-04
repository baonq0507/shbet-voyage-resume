import React from 'react';
import { PromotionCard } from './PromotionCard';
import { usePromotions } from '@/hooks/usePromotions';
import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const PromotionBanner: React.FC = () => {
  const { getLatestPromotion, loading } = usePromotions();
  const latestPromotion = getLatestPromotion();

  if (loading || !latestPromotion) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Khuyến mãi mới nhất</h3>
          </div>
          <Link to="/khuyen-mai">
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>
        <PromotionCard promotion={latestPromotion} variant="compact" />
      </div>
    </section>
  );
};