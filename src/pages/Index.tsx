import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleGamesList from "@/components/SimpleGamesList";
import { PromotionSection } from "@/components/PromotionSection";
import { PromotionBanner } from "@/components/PromotionBanner";
import { Shield, Clock, Users, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";
import MobileNavigation from "@/components/MobileNavigation";
import MobileAuthButtons from "@/components/MobileAuthButtons";
import { menuItems } from "@/utils/menuItems";

const Index = () => {
  // Get casino game GPIDs from menu configuration
  const casinoGpids = menuItems.find(item => item.id === 'casino')?.dropdown?.map(item => Number(item.id)) || [];

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
      <MobileAuthButtons onAuthClick={() => setIsAuthModalOpen(true)} />
      
      {/* Promotion Banner */}
      <PromotionBanner />

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Casino Games Section */}
      <SimpleGamesList 
        title="GAME CASINO HOT NHẤT" 
        category="casino"
        gpids={casinoGpids}
        maxGames={12} 
      />

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