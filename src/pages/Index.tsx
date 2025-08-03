import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";
import { Play, Star, Gift, Trophy, Shield, Clock, Users, Zap } from "lucide-react";
import casinoHero from "@/assets/casino-hero.jpg";
import nohuGame from "@/assets/nohu-game.jpg";
import bancaGame from "@/assets/banca-game.jpg";
import sportsGame from "@/assets/sports-game.jpg";
import cardsGame from "@/assets/cards-game.jpg";
import dagaGame from "@/assets/daga-game.jpg";

const Index = () => {
  const featuredGames = [
    {
      title: "Casino Trực Tuyến",
      description: "Trải nghiệm casino đỉnh cao với dealer thật",
      image: casinoHero,
      featured: true
    },
    {
      title: "Nổ Hũ Jackpot",
      description: "Hàng nghìn game nổ hũ với giải thưởng khủng",
      image: nohuGame,
      featured: true
    },
    {
      title: "Bắn Cá Online",
      description: "Game bắn cá 3D với đồ họa tuyệt đẹp",
      image: bancaGame
    },
    {
      title: "Thể Thao",
      description: "Cá cược thể thao với tỷ lệ cao nhất",
      image: sportsGame
    },
    {
      title: "Game Bài",
      description: "Poker, Baccarat, Tiến lên miền Nam",
      image: cardsGame
    },
    {
      title: "Đá Gà",
      description: "Đá gà truyền thống Việt Nam",
      image: dagaGame
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "An Ninh Bảo Mật",
      description: "Hệ thống bảo mật SSL 128bit"
    },
    {
      icon: Clock,
      title: "Giao Dịch Nhanh",
      description: "Nạp/rút tiền trong 1-5 phút"
    },
    {
      icon: Users,
      title: "Hỗ Trợ 24/7",
      description: "Đội ngũ CSKH chuyên nghiệp"
    },
    {
      icon: Zap,
      title: "Tỷ Lệ Cao",
      description: "Tỷ lệ thắng cao nhất thị trường"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${casinoHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">DINAMONDBET68</span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
            Nhà cái uy tín hàng đầu Việt Nam - Trải nghiệm cá cược đỉnh cao với hàng nghìn game hấp dẫn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="casino" size="lg" className="text-lg px-8 py-4">
              <Play className="w-6 h-6" />
              Chơi Ngay
            </Button>
            <Button variant="gold" size="lg" className="text-lg px-8 py-4">
              <Gift className="w-6 h-6" />
              Nhận Thưởng
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient mb-1">10M+</div>
              <div className="text-white/80">Thành Viên</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient mb-1">1000+</div>
              <div className="text-white/80">Game Hot</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient mb-1">99.9%</div>
              <div className="text-white/80">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient mb-1">24/7</div>
              <div className="text-white/80">Hỗ Trợ</div>
            </div>
          </div>
        </div>
      </section>


      {/* Games Section */}
      <GameSection title="GAME HOT NHẤT" games={featuredGames} />

      {/* Promotions */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            🎁 Khuyến Mãi Đặc Biệt 🎁
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="text-gradient">Thưởng Nạp Đầu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">Tối đa 5,000,000 VNĐ</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="text-gradient">Cashback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">10%</div>
                <p className="text-muted-foreground">Hoàn tiền hàng tuần</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="text-gradient">Giải Đấu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">1 Tỷ</div>
                <p className="text-muted-foreground">Giải thưởng tháng</p>
              </CardContent>
            </Card>
          </div>
          <Button variant="gold" size="lg" className="mt-8">
            <Trophy className="w-5 h-5" />
            Tham Gia Ngay
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
