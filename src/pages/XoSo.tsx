import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Trophy, Star, DollarSign } from "lucide-react";
import { menuItems } from "@/utils/menuItems";

export default function XoSo() {
  const xosoGpids = menuItems.find(item => item.id === 'xoso')?.dropdown?.map(item => Number(item.id)) || [];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-gradient-hero">
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            <span className="text-gradient">XỔ SỐ ONLINE</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Hệ thống xổ số trực tuyến uy tín với giải thưởng hấp dẫn
          </p>
          <Button variant="casino" size="lg" className="text-lg px-8 py-4">
            <Play className="w-6 h-6" />
            Chơi Ngay
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">99%</div>
              <div className="text-muted-foreground">Tỷ Lệ Trả Thưởng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">24/7</div>
              <div className="text-muted-foreground">Hoạt Động</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">5M+</div>
              <div className="text-muted-foreground">Giải Thưởng Lớn Nhất</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">30S</div>
              <div className="text-muted-foreground">Quay Thưởng</div>
            </div>
          </div>
        </div>
      </section>

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