import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { Play, Users, Trophy, Star } from "lucide-react";
import { menuItems } from "@/utils/menuItems";
import casinoHero from "@/assets/casino-hero.jpg";

const Casino = () => {
  const casinoGames = [
    {
      title: "Baccarat Live",
      description: "Chơi Baccarat với dealer thật từ studio HD",
      image: casinoHero,
      featured: true
    },
    {
      title: "Blackjack VIP",
      description: "Bàn blackjack cao cấp với tỷ lệ thắng cao",
      image: casinoHero,
      featured: true
    },
    {
      title: "Roulette European",
      description: "Roulette châu Âu chuẩn quốc tế",
      image: casinoHero
    },
    {
      title: "Dragon Tiger",
      description: "Game bài đơn giản, tỷ lệ thắng cao",
      image: casinoHero
    },
    {
      title: "Sicbo Live",
      description: "Xóc đĩa trực tuyến với dealer Việt Nam",
      image: casinoHero
    },
    {
      title: "Poker Live",
      description: "Poker Texas Hold'em chuyên nghiệp",
      image: casinoHero
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${casinoHero})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            <span className="text-gradient">CASINO TRỰC TUYẾN</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Trải nghiệm casino đẳng cấp thế giới với dealer thật, chất lượng HD
          </p>
          <Button variant="casino" size="lg" className="text-lg px-8 py-4">
            <Play className="w-6 h-6" />
            Vào Sảnh Casino
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">200+</div>
              <div className="text-muted-foreground">Bàn Chơi</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">50+</div>
              <div className="text-muted-foreground">Dealer Xinh Đẹp</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">98.5%</div>
              <div className="text-muted-foreground">Tỷ Lệ Trả Thưởng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-2">24/7</div>
              <div className="text-muted-foreground">Hoạt Động</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games */}
      <SimpleGamesList 
        title="GAME CASINO HOT NHẤT" 
        category="casino"
        gpids={menuItems.find(item => item.id === 'casino')?.dropdown?.map(item => Number(item.id)) || []} 
        maxGames={12} 
      />

      {/* Live Dealers */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            DEALER XINH ĐẸP - CHUYÊN NGHIỆP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Dealer Việt Nam</h3>
                <p className="text-muted-foreground">Giao tiếp tiếng Việt thân thiện</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Chất Lượng HD</h3>
                <p className="text-muted-foreground">Stream 4K không lag</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Tỷ Lệ Cao</h3>
                <p className="text-muted-foreground">RTP lên đến 98.5%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Casino;