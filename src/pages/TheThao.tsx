import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryGamesList from "@/components/CategoryGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import MobileNavigation from "@/components/MobileNavigation";
import MobileAuthButtons from "@/components/MobileAuthButtons";
import { Trophy, Target, TrendingUp, Users, Star } from "lucide-react";
import { menuItems } from "@/utils/menuItems";
import sportsGame from "@/assets/sports-game.jpg";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const TheThao = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const sportsGames = [
    {
      title: "SABA Thể Thao",
      description: "Cá cược thể thao với tỷ lệ cược cao nhất",
      image: sportsGame,
      featured: true
    },
    {
      title: "AFB Thể Thao",
      description: "Thể thao trực tuyến đa dạng",
      image: sportsGame,
      featured: true
    },
    {
      title: "BTI Thể Thao",
      description: "Cá cược thể thao chuyên nghiệp",
      image: sportsGame
    },
    {
      title: "PANDA Thể Thao",
      description: "Thể thao với giao diện đẹp",
      image: sportsGame
    },
    {
      title: "WS168 Thể Thao",
      description: "Cá cược thể thao uy tín",
      image: sportsGame
    },
    {
      title: "LUCKY Thể Thao",
      description: "Thể thao may mắn",
      image: sportsGame
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
      <CategoryGamesList 
        categoryId="thethao"
        title="THỂ THAO HOT NHẤT"
      />

      {/* Live Sports Features */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            🏆 TÍNH NĂNG VƯỢT TRỘI 🏆
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Tỷ Lệ Cao</h3>
                <p className="text-muted-foreground">Tỷ lệ cược hấp dẫn nhất thị trường</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Live Betting</h3>
                <p className="text-muted-foreground">Cược trực tiếp trong suốt trận đấu</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Cash Out</h3>
                <p className="text-muted-foreground">Rút tiền sớm để bảo toàn lợi nhuận</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sports Types */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient">CÁC MÔN THỂ THAO</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Bóng Đá', icon: '⚽' },
              { name: 'Bóng Rổ', icon: '🏀' },
              { name: 'Tennis', icon: '🎾' },
              { name: 'Bóng Chuyền', icon: '🏐' },
              { name: 'E-Sports', icon: '🎮' },
              { name: 'Cầu Lông', icon: '🏸' },
              { name: 'Bóng Bàn', icon: '🏓' },
              { name: 'Boxing', icon: '🥊' }
            ].map((sport) => (
              <div key={sport.name} className="text-center p-6 rounded-lg bg-gradient-primary/10 hover:bg-gradient-primary/20 transition-all cursor-pointer casino-glow">
                <div className="text-4xl mb-3">{sport.icon}</div>
                <div className="font-bold text-gradient">{sport.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Sports */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            LIVE SPORTS - TỈ LỆ CHUẨN QUỐC TẾ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Tỷ Lệ Cạnh Tranh</h3>
                <p className="text-muted-foreground">Odds cao nhất thị trường</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Live Streaming</h3>
                <p className="text-muted-foreground">Xem trực tiếp miễn phí</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Cash Out Nhanh</h3>
                <p className="text-muted-foreground">Rút tiền thắng tức thì</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default TheThao;