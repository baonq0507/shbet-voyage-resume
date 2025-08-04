import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";
import { GamesList } from "@/components/GamesList";
import { PromotionSection } from "@/components/PromotionSection";
import { Play, Star, Gift, Trophy, Shield, Clock, Users, Zap, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";
import MobileNavigation from "@/components/MobileNavigation";
import casinoHero from "@/assets/casino-hero.jpg";
import casinoBannerNew from "@/assets/casino-banner-new.png";
import nohuGame from "@/assets/nohu-game.jpg";
import bancaGame from "@/assets/banca-game.jpg";
import sportsGame from "@/assets/sports-game.jpg";
import cardsGame from "@/assets/cards-game.jpg";
import dagaGame from "@/assets/daga-game.jpg";
import evoLogo from "@/assets/lobbies/evo.png";
import pragmaticLogo from "@/assets/lobbies/pragmatic.png";
import playtechLogo from "@/assets/lobbies/playtech.png";
import microgamingLogo from "@/assets/lobbies/microgaming.png";
import netentLogo from "@/assets/lobbies/netent.jpg";
import sportsLogo from "@/assets/lobbies/sports.png";

const Index = () => {
  const casinoLobbies = [
    {
      id: "evo",
      name: "EVO Gaming",
      logo: evoLogo,
      games: [
        {
          title: "Live Baccarat",
          description: "Baccarat trực tiếp với dealer xinh đẹp",
          image: casinoHero,
          featured: true
        },
        {
          title: "Live Roulette",
          description: "Roulette Châu Âu chuẩn quốc tế",
          image: cardsGame
        },
        {
          title: "Live Blackjack",
          description: "Blackjack với tỷ lệ thắng cao",
          image: cardsGame
        }
      ]
    },
    {
      id: "pragmatic",
      name: "Pragmatic Play",
      logo: pragmaticLogo,
      games: [
        {
          title: "Sweet Bonanza",
          description: "Slot game ngọt ngào với jackpot khủng",
          image: nohuGame,
          featured: true
        },
        {
          title: "Gates of Olympus",
          description: "Thần Zeus mang lại vận may",
          image: nohuGame
        },
        {
          title: "Sugar Rush",
          description: "Kẹo ngọt mang lại tài lộc",
          image: nohuGame
        }
      ]
    },
    {
      id: "playtech",
      name: "Playtech",
      logo: playtechLogo,
      games: [
        {
          title: "Age of Gods",
          description: "Slot thần thoại Hy Lạp",
          image: nohuGame
        },
        {
          title: "Marvel Slots",
          description: "Siêu anh hùng Marvel",
          image: nohuGame,
          featured: true
        }
      ]
    },
    {
      id: "microgaming",
      name: "Microgaming",
      logo: microgamingLogo,
      games: [
        {
          title: "Mega Moolah",
          description: "Jackpot triệu USD",
          image: nohuGame,
          featured: true
        },
        {
          title: "Immortal Romance",
          description: "Câu chuyện tình ma cà rồng",
          image: nohuGame
        }
      ]
    },
    {
      id: "netent",
      name: "NetEnt",
      logo: netentLogo,
      games: [
        {
          title: "Starburst",
          description: "Game slot kinh điển nhất",
          image: nohuGame
        },
        {
          title: "Gonzo's Quest",
          description: "Cuộc phiêu lưu tìm kho báu",
          image: nohuGame
        }
      ]
    },
    {
      id: "sports",
      name: "Thể Thao",
      logo: sportsLogo,
      games: [
        {
          title: "Bóng Đá",
          description: "Cá cược bóng đá quốc tế",
          image: sportsGame,
          featured: true
        },
        {
          title: "Bóng Rổ",
          description: "NBA, VBA và các giải đấu lớn",
          image: sportsGame
        },
        {
          title: "Bắn Cá 3D",
          description: "Game bắn cá đồ họa 3D tuyệt đẹp",
          image: bancaGame
        },
        {
          title: "Đá Gà",
          description: "Đá gà truyền thống Việt Nam",
          image: dagaGame
        }
      ]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "An Ninh Bảo Mật",
      description: "Hệ thống bảo mật SSL 128bit"
    },
    {
      icon: Clock,
      title: "Giao Dịch Nhanh",
      description: "Nạp/rút tiền trong 1-5 phút"
    },
    {
      icon: Users,
      title: "Hỗ Trợ 24/7",
      description: "Đội ngũ CSKH chuyên nghiệp"
    },
    {
      icon: Zap,
      title: "Tỷ Lệ Cao",
      description: "Tỷ lệ thắng cao nhất thị trường"
    }
  ];

  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[350px] lg:h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${casinoHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-85" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-4 md:gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="text-left space-y-3 md:space-y-4 lg:space-y-8">
              <div className="space-y-2 md:space-y-3 lg:space-y-4">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-6xl xl:text-7xl font-black mb-2 md:mb-3 lg:mb-4 leading-tight">
                  <img 
                    src="/lovable-uploads/5f8b7fab-93aa-4385-bb91-920f8493ebb9.png" 
                    alt="DINAMONDBET68" 
                    className="h-8 sm:h-12 md:h-16 lg:h-28 xl:h-32 w-auto object-contain drop-shadow-2xl"
                  />
                </h1>
                <div className="w-16 md:w-20 lg:w-32 h-1 md:h-1.5 lg:h-2 bg-gradient-primary rounded-full casino-glow"></div>
              </div>
              
              <p className="text-xs sm:text-sm md:text-base lg:text-2xl text-white/95 leading-relaxed max-w-2xl font-medium">
                Nhà cái uy tín hàng đầu Việt Nam
                <br className="hidden md:block" />
                <span className="text-yellow-300 font-bold">Trải nghiệm cá cược đỉnh cao</span>
                <br className="hidden md:block" />
                với hàng nghìn game hấp dẫn
              </p>
              
              {!user ? (
                <div className="flex flex-col md:flex-row gap-3 md:gap-3 lg:gap-6 pt-2 md:pt-3 lg:pt-4">
                  <Button 
                    variant="casino" 
                    size="sm" 
                    className="text-xs sm:text-sm md:text-sm lg:text-xl px-4 sm:px-8 md:px-8 lg:px-12 py-3 md:py-3 lg:py-6 font-bold casino-glow hover:scale-105 transition-all duration-300"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-7 lg:h-7" />
                    Đăng Nhập
                  </Button>
                  <Button 
                    variant="gold" 
                    size="sm" 
                    className="text-xs sm:text-sm md:text-sm lg:text-xl px-4 sm:px-8 md:px-8 lg:px-12 py-3 md:py-3 lg:py-6 font-bold gold-glow hover:scale-105 transition-all duration-300"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-7 lg:h-7" />
                    Đăng Ký
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-3 md:gap-3 lg:gap-6 pt-2 md:pt-3 lg:pt-4">
                  <Button variant="casino" size="sm" className="text-xs sm:text-sm md:text-sm lg:text-xl px-4 sm:px-8 md:px-8 lg:px-12 py-3 md:py-3 lg:py-6 font-bold casino-glow hover:scale-105 transition-all duration-300">
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-7 lg:h-7" />
                    Chơi Ngay
                  </Button>
                  <Button variant="gold" size="sm" className="text-xs sm:text-sm md:text-sm lg:text-xl px-4 sm:px-8 md:px-8 lg:px-12 py-3 md:py-3 lg:py-6 font-bold gold-glow hover:scale-105 transition-all duration-300">
                    <Gift className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-7 lg:h-7" />
                    Nhận Thưởng
                  </Button>
                </div>
              )}
            </div>
            
            {/* Right Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-2xl scale-110"></div>
                <img 
                  src={casinoBannerNew} 
                  alt="Casino Banner" 
                  className="relative max-w-full h-auto object-contain w-full hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Games Section */}
      <GameSection title="GAME HOT NHẤT" lobbies={casinoLobbies} showApiGames={true} gpid={5} />

      {/* Dynamic Promotions Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PromotionSection variant="home" maxItems={4} />
        </div>
      </section>

      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
