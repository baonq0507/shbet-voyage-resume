import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryGamesList from "@/components/CategoryGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import MobileNavigation from "@/components/MobileNavigation";

const NoHu = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
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
    </div>
  );
};

export default NoHu;