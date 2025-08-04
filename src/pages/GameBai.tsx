import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
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
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${cardsGame})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            <span className="text-gradient">GAME BÀI ĐỔI THƯỞNG</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Tập hợp các game bài dân gian Việt Nam và quốc tế
          </p>
        </div>
      </section>

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