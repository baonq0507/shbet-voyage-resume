import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";
import { Play, Star, Gift, Trophy, Shield, Clock, Users, Zap } from "lucide-react";
import casinoHero from "@/assets/casino-hero.jpg";
import casinoBanner from "@/assets/casino-banner.png";
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
      
      {/* Welcome Banner */}
      <section className="relative py-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide-in-right"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-lg md:text-xl lg:text-2xl font-black text-white animate-fade-in">
              <span className="inline-block animate-pulse mr-2">🎉</span>
              <span className="text-shadow-lg tracking-wide">
                CHÀO MỪNG ĐẾN VỚI 
                <span className="text-yellow-300 mx-2 font-extrabold text-xl md:text-2xl lg:text-3xl">
                  DINAMONDBET68
                </span>
                - NHÀ CÁI UY TÍN HÀNG ĐẦU VIỆT NAM
              </span>
              <span className="inline-block animate-pulse ml-2">🎉</span>
            </h1>
          </div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${casinoHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-gradient">DINAMONDBET68</span>
              </h1>
              <p className="text-xl md:text-2xl text-white mb-8">
                Nhà cái uy tín hàng đầu Việt Nam - Trải nghiệm cá cược đỉnh cao với hàng nghìn game hấp dẫn
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="casino" size="lg" className="text-lg px-8 py-4">
                  <Play className="w-6 h-6" />
                  Chơi Ngay
                </Button>
                <Button variant="gold" size="lg" className="text-lg px-8 py-4">
                  <Gift className="w-6 h-6" />
                  Nhận Thưởng
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gradient mb-1">10M+</div>
                  <div className="text-white/80">Thành Viên</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gradient mb-1">1000+</div>
                  <div className="text-white/80">Game Hot</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gradient mb-1">99.9%</div>
                  <div className="text-white/80">Uptime</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gradient mb-1">24/7</div>
                  <div className="text-white/80">Hỗ Trợ</div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="flex justify-center lg:justify-end">
              <img 
                src={casinoBanner} 
                alt="Casino Banner" 
                className="max-w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Games Section */}
      <GameSection title="GAME HOT NHẤT" lobbies={casinoLobbies} />

      {/* Promotions */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            🎁 Khuyến Mãi Đặc Biệt 🎁
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="text-gradient">Thưởng Nạp Đầu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">Tối đa 5,000,000 VNĐ</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="text-gradient">Cashback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">10%</div>
                <p className="text-muted-foreground">Hoàn tiền hàng tuần</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="text-gradient">Giải Đấu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">1 Tỷ</div>
                <p className="text-muted-foreground">Giải thưởng tháng</p>
              </CardContent>
            </Card>
          </div>
          <Button variant="gold" size="lg" className="mt-8">
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
