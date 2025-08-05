import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import MobileNavigation from "@/components/MobileNavigation";
import MobileAuthButtons from "@/components/MobileAuthButtons";
import { menuItems } from "@/utils/menuItems";
import dagaGame from "@/assets/daga-game.jpg";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const DaGa = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const dagaGames = [
    {
      title: "Đá Gà Trực Tiếp",
      description: "Xem và cược đá gà trực tiếp",
      image: dagaGame,
      featured: true
    },
    {
      title: "Đá Gà Campuchia",
      description: "Đá gà chất lượng cao từ Campuchia",
      image: dagaGame,
      featured: true
    },
    {
      title: "Đá Gà Philippines",
      description: "Sabong truyền thống Philippines",
      image: dagaGame
    },
    {
      title: "Đá Gà Peru",
      description: "Đá gà Nam Mỹ hấp dẫn",
      image: dagaGame
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
      <SimpleGamesList 
        title="TRƯỜNG GÀ UY TÍN" 
        category="cockfight"
        gpids={menuItems.find(item => item.id === 'daga')?.dropdown?.map(item => Number(item.id)) || []} 
        maxGames={12} 
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

export default DaGa;