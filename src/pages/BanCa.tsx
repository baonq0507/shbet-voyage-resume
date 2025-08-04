import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";
import { Target, Fish, Waves } from "lucide-react";
import bancaGame from "@/assets/banca-game.jpg";

const BanCa = () => {
  const bancaGames = [
    {
      title: "Thần Tài Bắn Cá",
      description: "Game bắn cá 3D với đồ họa tuyệt đẹp",
      image: bancaGame,
      featured: true
    },
    {
      title: "Đại Chiến Đại Dương",
      description: "Chiến đấu với quái vật biển khổng lồ",
      image: bancaGame,
      featured: true
    },
    {
      title: "Cá Vàng May Mắn",
      description: "Săn cá vàng nhận thưởng cực khủng",
      image: bancaGame
    },
    {
      title: "Rồng Cung Bắn Cá",
      description: "Rồng cung huyền thoại dưới đáy biển",
      image: bancaGame
    },
    {
      title: "Ngư Dân Siêu Sao",
      description: "Trở thành ngư dân giỏi nhất đại dương",
      image: bancaGame
    },
    {
      title: "Cá Tôm Cua",
      description: "Game bắn cá phong cách Việt Nam",
      image: bancaGame
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bancaGame})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            <span className="text-gradient">BẮN CÁ ĐỔI THƯỞNG</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Trải nghiệm game bắn cá 3D đỉnh cao với đồ họa sống động
          </p>
          <Button variant="casino" size="lg" className="text-lg px-8 py-4">
            <Target className="w-6 h-6" />
            Bắn Cá Ngay
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            🐠 ĐẶC ĐIỂM NỔI BẬT 🐠
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 casino-glow">
              <Fish className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-gradient">Đa Dạng Cá</h3>
              <div className="text-white/80">Hơn 100 loài cá với giá trị khác nhau</div>
            </div>
            <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 casino-glow">
              <Target className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-gradient">Vũ Khí Đa Dạng</h3>
              <div className="text-white/80">Nhiều loại súng với sức mạnh khác nhau</div>
            </div>
            <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 casino-glow">
              <Waves className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-gradient">Boss Khủng</h3>
              <div className="text-white/80">Thử thách với boss cá dev siêu to</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games */}
      <GameSection title="GAME BẮN CÁ HOT NHẤT" showApiGames={true} defaultCategory="arcade" />

      <Footer />
    </div>
  );
};

export default BanCa;