import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import { Zap, Coins, Gift } from "lucide-react";
import { menuItems } from "@/utils/menuItems";
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
      
      {/* Banner */}
      <PromotionBanner />


      {/* Games */}
      <SimpleGamesList 
        title="GAME NỔ HŨ HOT NHẤT" 
        category="slots"
        gpids={menuItems.find(item => item.id === 'nohu')?.dropdown?.map(item => Number(item.id)) || []} 
        maxGames={12} 
      />

      <Footer />
    </div>
  );
};

export default NoHu;