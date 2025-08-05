import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import MobileNavigation from "@/components/MobileNavigation";
import { menuItems } from "@/utils/menuItems";
import cardsGame from "@/assets/cards-game.jpg";

const GameBai = () => {
  const cardGames = [
    {
      title: "Tiến Lên Miền Nam",
      description: "Game bài dân gian Việt Nam",
      image: cardsGame,
      featured: true
    },
    {
      title: "Phỏm - Tá Lả",
      description: "Game bài truyền thống hấp dẫn",
      image: cardsGame,
      featured: true
    },
    {
      title: "Poker Texas",
      description: "Poker phong cách quốc tế",
      image: cardsGame
    },
    {
      title: "Bài Cào",
      description: "Game bài đơn giản, dễ chơi",
      image: cardsGame
    },
    {
      title: "Xì Dách",
      description: "Blackjack phong cách Việt",
      image: cardsGame
    },
    {
      title: "Liêng",
      description: "Game bài 3 lá truyền thống",
      image: cardsGame
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Banner */}
      <PromotionBanner />

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Games */}
      <SimpleGamesList 
        title="GAME BÀI HOT NHẤT" 
        category="card-games"
        gpids={menuItems.find(item => item.id === 'gamebai')?.dropdown?.map(item => Number(item.id)) || []} 
        maxGames={12} 
      />

      <Footer />
    </div>
  );
};

export default GameBai;