import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryGamesList from "@/components/CategoryGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import MobileNavigation from "@/components/MobileNavigation";
import MobileAuthButtons from "@/components/MobileAuthButtons";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const NoHu = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
        categoryId="nohu"
        title="GAME NỔ HŨ"
      />

      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default NoHu;