import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Clock, Star, TrendingUp, Zap, Trophy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const KhuyenMai = () => {
  const promotions = [
    {
      id: 1,
      title: "Khuyến Mại Chào Mừng",
      description: "Nhận ngay 100% tiền thưởng lần nạp đầu tiên",
      bonus: "100%",
      type: "Nạp Đầu",
      timeLeft: "Không giới hạn",
      icon: Gift,
      color: "bg-gradient-to-r from-yellow-500 to-orange-500"
    },
    {
      id: 2,
      title: "Hoàn Trả Hàng Ngày",
      description: "Hoàn trả 5% tổng cược mỗi ngày cho tất cả trò chơi",
      bonus: "5%",
      type: "Hoàn Trả",
      timeLeft: "Hàng ngày",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      title: "Thưởng Nạp Cuối Tuần",
      description: "Nhận thêm 50% bonus khi nạp tiền vào cuối tuần",
      bonus: "50%",
      type: "Cuối Tuần",
      timeLeft: "2 ngày",
      icon: Star,
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      id: 4,
      title: "Giải Đấu Hàng Tuần",
      description: "Tham gia giải đấu với tổng giải thưởng 1 tỷ VNĐ",
      bonus: "1B VNĐ",
      type: "Giải Đấu",
      timeLeft: "5 ngày",
      icon: Trophy,
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      id: 5,
      title: "Lucky Spin",
      description: "Quay bánh xe may mắn miễn phí mỗi ngày",
      bonus: "Free",
      type: "Spin",
      timeLeft: "Hàng ngày",
      icon: Zap,
      color: "bg-gradient-to-r from-red-500 to-rose-500"
    },
    {
      id: 6,
      title: "VIP Rewards",
      description: "Ưu đãi đặc biệt dành cho thành viên VIP",
      bonus: "VIP",
      type: "Đặc Biệt",
      timeLeft: "Vĩnh viễn",
      icon: Star,
      color: "bg-gradient-to-r from-amber-500 to-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">KHUYẾN MẠI HOT</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Nhận ngay những ưu đãi đặc biệt và khuyến mại hấp dẫn chỉ có tại DINAMONDBET68
            </p>
          </div>
        </div>
      </section>

      {/* Promotions Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => {
              const IconComponent = promo.icon;
              return (
                <Card key={promo.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-3 rounded-full ${promo.color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary">{promo.type}</Badge>
                    </div>
                    <CardTitle className="text-xl font-bold">{promo.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{promo.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gradient">{promo.bonus}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {promo.timeLeft}
                      </div>
                    </div>
                    <Button className="w-full" variant="default">
                      Nhận Ngay
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terms Section */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Điều Kiện & Điều Khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Điều kiện chung:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Chỉ áp dụng cho thành viên đã xác thực tài khoản</li>
                    <li>• Mỗi tài khoản chỉ được tham gia một lần</li>
                    <li>• Bonus phải được sử dụng trong vòng 30 ngày</li>
                    <li>• Yêu cầu cược tối thiểu 10x số tiền bonus</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Quy định rút tiền:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Hoàn thành điều kiện cược trước khi rút</li>
                    <li>• Thời gian xử lý: 5-15 phút</li>
                    <li>• Hỗ trợ 24/7 qua Live Chat</li>
                    <li>• Tuân thủ chính sách chống rửa tiền</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KhuyenMai;