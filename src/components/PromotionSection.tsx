import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PromotionCard } from './PromotionCard';
import { usePromotions } from '@/hooks/usePromotions';
import { Gift, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PromotionSectionProps {
  variant?: 'home' | 'full';
  maxItems?: number;
}

export const PromotionSection: React.FC<PromotionSectionProps> = ({ 
  variant = 'home', 
  maxItems = 3 
}) => {
  const { promotions, loading, getLatestPromotion, getActivePromotions } = usePromotions();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activePromotions = getActivePromotions();
  const latestPromotion = getLatestPromotion();

  if (activePromotions.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có khuyến mãi</h3>
          <p className="text-muted-foreground">
            Hiện tại chưa có chương trình khuyến mãi nào. Hãy quay lại sau nhé!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'home') {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Khuyến mãi hot</h2>
          </div>
          <Link to="/khuyenmai">
            <Button variant="outline" className="flex items-center gap-2">
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Featured latest promotion */}
        {latestPromotion && (
          <div className="mb-6">
            <PromotionCard promotion={latestPromotion} variant="featured" />
          </div>
        )}

        {/* Other active promotions */}
        {activePromotions.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePromotions
              .slice(1, maxItems)
              .map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Gift className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Tất cả khuyến mãi</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activePromotions.map((promotion) => (
          <PromotionCard key={promotion.id} promotion={promotion} />
        ))}
      </div>
    </section>
  );
};
