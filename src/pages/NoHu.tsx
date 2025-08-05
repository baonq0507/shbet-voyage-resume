import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryGamesList from "@/components/CategoryGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";

const NoHu = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Banner */}
      <PromotionBanner />

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