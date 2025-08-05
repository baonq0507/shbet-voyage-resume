import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryGamesList from "@/components/CategoryGamesList";
import { PromotionBanner } from "@/components/PromotionBanner";
import { Users, Trophy, Star } from "lucide-react";

const Casino = () => {

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Banner */}
      <PromotionBanner />


      {/* Games */}
      <CategoryGamesList 
        categoryId="casino"
        title="GAME CASINO"
      />

      {/* Live Dealers */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            DEALER XINH ĐẸP - CHUYÊN NGHIỆP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Dealer Việt Nam</h3>
                <p className="text-muted-foreground">Giao tiếp tiếng Việt thân thiện</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Chất Lượng HD</h3>
                <p className="text-muted-foreground">Stream 4K không lag</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="pt-6">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-gradient">Tỷ Lệ Cao</h3>
                <p className="text-muted-foreground">RTP lên đến 98.5%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Casino;