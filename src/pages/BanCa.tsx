import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import MobileNavigation from "@/components/MobileNavigation";
import MobileAuthButtons from "@/components/MobileAuthButtons";
import { Target, Fish, Waves } from "lucide-react";
import { menuItems } from "@/utils/menuItems";
import bancaGame from "@/assets/banca-game.jpg";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const BanCa = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
      
      {/* Mobile Auth Buttons */}
      <MobileAuthButtons onAuthClick={() => setIsAuthModalOpen(true)} />
      
      {/* Banner */}
      <PromotionBanner />

      {/* Mobile Navigation */}
      <MobileNavigation />


      {/* Games */}
      <SimpleGamesList 
        title="GAME BẮN CÁ HOT NHẤT" 
        category="fishing"
        gpids={menuItems.find(item => item.id === 'banca')?.dropdown?.map(item => Number(item.id)) || []} 
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

export default BanCa;