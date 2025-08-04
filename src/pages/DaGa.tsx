import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";
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
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dagaGame})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            <span className="text-gradient">ĐÁ GÀ TRỰC TUYẾN</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Môn thể thao truyền thống Việt Nam với chất lượng HD
          </p>
        </div>
      </section>

      {/* Games */}
      <GameSection title="TRƯỜNG GÀ UY TÍN" showApiGames={true} defaultCategory="sports" />

      <Footer />
    </div>
  );
};

export default DaGa;