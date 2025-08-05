import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";
import { GamesList } from "@/components/GamesList";
import { PromotionSection } from "@/components/PromotionSection";
import { PromotionBanner } from "@/components/PromotionBanner";
import { AuthButtons } from "@/components/AuthButtons";
import { Play, Star, Gift, Trophy, Shield, Clock, Users, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";
import MobileNavigation from "@/components/MobileNavigation";
import MobileAuthButtons from "@/components/MobileAuthButtons";
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
import { PAGE_GPID_CONFIG } from "@/config/gameConfig";

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
          image: cardsGame,
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
      
      {/* Mobile Auth Buttons */}
      <MobileAuthButtons />
      
      {/* Promotion Banner */}
      <PromotionBanner />


      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Games Section */}
      <GameSection title="GAME HOT NHẤT" lobbies={casinoLobbies} showApiGames={true} gpids={[PAGE_GPID_CONFIG.HOME]} />

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
