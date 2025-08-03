import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";
import { Play, Star, Gift, Trophy, Shield, Clock, Users, Zap } from "lucide-react";
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

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${casinoHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6">
                <span className="text-gradient">DINAMONDBET68</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 md:mb-8 leading-relaxed">
                Nhà cái uy tín hàng đầu Việt Nam - Trải nghiệm cá cược đỉnh cao với hàng nghìn game hấp dẫn
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button variant="casino" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                  Chơi Ngay
                </Button>
                <Button variant="gold" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                  Nhận Thưởng
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
                <div className="text-center lg:text-left bg-black/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient mb-1">10M+</div>
                  <div className="text-white/80 text-xs sm:text-sm">Thành Viên</div>
                </div>
                <div className="text-center lg:text-left bg-black/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient mb-1">1000+</div>
                  <div className="text-white/80 text-xs sm:text-sm">Game Hot</div>
                </div>
                <div className="text-center lg:text-left bg-black/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient mb-1">99.9%</div>
                  <div className="text-white/80 text-xs sm:text-sm">Uptime</div>
                </div>
                <div className="text-center lg:text-left bg-black/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient mb-1">24/7</div>
                  <div className="text-white/80 text-xs sm:text-sm">Hỗ Trợ</div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <img 
                src={casinoBannerNew} 
                alt="Casino Banner" 
                className="max-w-full h-auto object-contain w-full max-w-md lg:max-w-lg xl:max-w-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Games Section */}
      <GameSection title="GAME HOT NHẤT" lobbies={casinoLobbies} />

      {/* Promotions */}
      <section className="py-12 md:py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-white">
            🎁 Khuyến Mãi Đặc Biệt 🎁
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <Card className="casino-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gradient text-lg sm:text-xl">Thưởng Nạp Đầu</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground text-sm sm:text-base">Tối đa 5,000,000 VNĐ</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gradient text-lg sm:text-xl">Cashback</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">10%</div>
                <p className="text-muted-foreground text-sm sm:text-base">Hoàn tiền hàng tuần</p>
              </CardContent>
            </Card>
            <Card className="casino-glow sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-gradient text-lg sm:text-xl">Giải Đấu</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">1 Tỷ</div>
                <p className="text-muted-foreground text-sm sm:text-base">Giải thưởng tháng</p>
              </CardContent>
            </Card>
          </div>
          <Button variant="gold" size="lg" className="mt-6 md:mt-8 w-full sm:w-auto">
            <Trophy className="w-5 h-5" />
            Tham Gia Ngay
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
