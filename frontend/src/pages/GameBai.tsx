import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryGamesList from "@/components/CategoryGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import MobileNavigation from "@/components/MobileNavigation";
import MobileAuthButtons from "@/components/MobileAuthButtons";
import { menuItems } from "@/utils/menuItems";
import cardsGame from "@/assets/cards-game.jpg";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const GameBai = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
      
      {/* Mobile Auth Buttons */}
      <MobileAuthButtons onAuthClick={() => setIsAuthModalOpen(true)} />
      
      {/* Banner */}
      <PromotionBanner />

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Games */}
      <CategoryGamesList 
        categoryId="gamebai"
        title="GAME BÀI HOT NHẤT"
      />

      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default GameBai;