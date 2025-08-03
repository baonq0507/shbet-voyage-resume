import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";
import { Zap, Coins, Gift } from "lucide-react";
import nohuGame from "@/assets/nohu-game.jpg";

const NoHu = () => {
  const nohuGames = [
    {
      title: "Zeus Jackpot",
      description: "Game nổ hũ thần thoại với jackpot khủng",
      image: nohuGame,
      featured: true
    },
    {
      title: "Lucky Dragons",
      description: "Rồng may mắn mang về vàng bạc",
      image: nohuGame,
      featured: true
    },
    {
      title: "Fruit Paradise",
      description: "Thiên đường trái cây với giải thưởng lớn",
      image: nohuGame
    },
    {
      title: "Wild West",
      description: "Miền Tây hoang dã với sheriff jackpot",
      image: nohuGame
    },
    {
      title: "Ocean Treasure",
      description: "Kho báu đại dương chờ bạn khám phá",
      image: nohuGame
    },
    {
      title: "Egyptian Gold",
      description: "Vàng Ai Cập cổ đại huyền bí",
      image: nohuGame
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${nohuGame})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            <span className="text-gradient">NỔ HŨ JACKPOT</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Hàng nghìn game nổ hũ với jackpot lên đến hàng tỷ đồng
          </p>
          <Button variant="gold" size="lg" className="text-lg px-8 py-4">
            <Zap className="w-6 h-6" />
            Nổ Hũ Ngay
          </Button>
        </div>
      </section>

      {/* Jackpot Info */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            💰 JACKPOT KHỦNG ĐANG CHỜ BẠN 💰
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 casino-glow">
              <Coins className="w-12 h-12 text-secondary mx-auto mb-4" />
              <div className="text-2xl font-bold text-gradient mb-2">5.2 TỶ VNĐ</div>
              <div className="text-white/80">Jackpot Lớn Nhất</div>
            </div>
            <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 casino-glow">
              <Gift className="w-12 h-12 text-secondary mx-auto mb-4" />
              <div className="text-2xl font-bold text-gradient mb-2">1000+</div>
              <div className="text-white/80">Game Nổ Hũ</div>
            </div>
            <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 casino-glow">
              <Zap className="w-12 h-12 text-secondary mx-auto mb-4" />
              <div className="text-2xl font-bold text-gradient mb-2">99.1%</div>
              <div className="text-white/80">Tỷ Lệ Trả Thưởng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games */}
      <GameSection title="GAME NỔ HŨ HOT NHẤT" showApiGames={true} defaultCategory="slots" />

      <Footer />
    </div>
  );
};

export default NoHu;