import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Trophy, Star, DollarSign } from "lucide-react";
import { menuItems } from "@/utils/menuItems";

export default function XoSo() {
  const xosoGpids = menuItems.find(item => item.id === 'xoso')?.dropdown?.map(item => Number(item.id)) || [];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Banner */}
      <PromotionBanner />


      {/* Games */}
      <SimpleGamesList title="GAME XỔ SỐ HOT NHẤT" gpids={xosoGpids} maxGames={12} />

      {/* Features */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            TÍNH NĂNG NỔI BẬT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Giải Thưởng Khủng</h3>
                <p className="text-muted-foreground">Jackpot lên đến hàng tỷ đồng</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Công Bằng</h3>
                <p className="text-muted-foreground">Kết quả minh bạch 100%</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Nhanh Chóng</h3>
                <p className="text-muted-foreground">Trả thưởng tức thì</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}