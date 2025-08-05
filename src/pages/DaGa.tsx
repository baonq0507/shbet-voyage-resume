import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import { menuItems } from "@/utils/menuItems";
import dagaGame from "@/assets/daga-game.jpg";

const DaGa = () => {
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
      
      {/* Banner */}
      <PromotionBanner />

      {/* Games */}
      <SimpleGamesList 
        title="TRƯỜNG GÀ UY TÍN" 
        category="cockfight"
        gpids={menuItems.find(item => item.id === 'daga')?.dropdown?.map(item => Number(item.id)) || []} 
        maxGames={12} 
      />

      <Footer />
    </div>
  );
};

export default DaGa;