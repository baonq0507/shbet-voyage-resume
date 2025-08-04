import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Clock, Users } from 'lucide-react';

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
  created_at: string;
  updated_at: string;
}

interface PromotionCardProps {
  promotion: Promotion;
  variant?: 'default' | 'featured' | 'compact';
}

export const PromotionCard: React.FC<PromotionCardProps> = ({ 
  promotion, 
  variant = 'default' 
}) => {
  const formatDiscount = () => {
    if (promotion.discount_percentage) {
      return `${promotion.discount_percentage}% OFF`;
    }
    if (promotion.discount_amount) {
      return `Giảm ${promotion.discount_amount.toLocaleString()} VND`;
    }
    return 'Khuyến mãi đặc biệt';
  };

  const formatDateRange = () => {
    const startDate = new Date(promotion.start_date).toLocaleDateString('vi-VN');
    const endDate = new Date(promotion.end_date).toLocaleDateString('vi-VN');
    return `${startDate} - ${endDate}`;
  };

  const getRemainingDays = () => {
    const endDate = new Date(promotion.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRemainingUses = () => {
    if (!promotion.max_uses) return null;
    return promotion.max_uses - promotion.current_uses;
  };

  if (variant === 'compact') {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold text-sm">{promotion.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {formatDiscount()}
                </Badge>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Xem chi tiết
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="relative overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
          KHUYẾN MÃI HOT
        </div>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">{promotion.title}</CardTitle>
          </div>
          <CardDescription className="text-base">
            {promotion.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {formatDiscount()}
            </div>
            {promotion.min_deposit && (
              <p className="text-sm text-muted-foreground">
                Áp dụng cho nạp tiền từ {promotion.min_deposit.toLocaleString()} VND
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Còn {getRemainingDays()} ngày</span>
            </div>
            {getRemainingUses() && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Còn {getRemainingUses()} suất</span>
              </div>
            )}
          </div>

          <Button className="w-full" size="lg">
            Áp dụng ngay
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{promotion.title}</CardTitle>
          </div>
          <Badge variant="default">
            {formatDiscount()}
          </Badge>
        </div>
        {promotion.description && (
          <CardDescription>{promotion.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {promotion.min_deposit && (
          <p className="text-sm text-muted-foreground">
            Áp dụng cho nạp tiền từ: {promotion.min_deposit.toLocaleString()} VND
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDateRange()}</span>
          </div>
          {getRemainingUses() && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Còn {getRemainingUses()} suất</span>
            </div>
          )}
        </div>

        <Button className="w-full" variant="outline">
          Xem chi tiết
        </Button>
      </CardContent>
    </Card>
  );
};