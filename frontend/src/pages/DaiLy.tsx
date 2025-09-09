import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, Award, Phone, Mail, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";

const DaiLy = () => {
  const commissionLevels = [
    {
      level: "Đại Lý Cấp 1",
      commission: "45%",
      requirement: "5 người chơi",
      color: "bg-gradient-to-r from-bronze-500 to-bronze-600",
      benefits: ["Hoa hồng 45%", "Hỗ trợ 24/7", "Tài liệu marketing"]
    },
    {
      level: "Đại Lý Cấp 2", 
      commission: "50%",
      requirement: "20 người chơi",
      color: "bg-gradient-to-r from-silver-500 to-silver-600",
      benefits: ["Hoa hồng 50%", "Quà tặng hàng tháng", "Đào tạo chuyên sâu", "Hỗ trợ quảng cáo"]
    },
    {
      level: "Đại Lý Cấp 3",
      commission: "55%",
      requirement: "50 người chơi", 
      color: "bg-gradient-to-r from-yellow-500 to-amber-500",
      benefits: ["Hoa hồng 55%", "Bonus đặc biệt", "Sự kiện VIP", "Hỗ trợ 1-1", "Tools marketing pro"]
    },
    {
      level: "Đại Lý Kim Cương",
      commission: "60%",
      requirement: "100 người chơi",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500", 
      benefits: ["Hoa hồng 60%", "Thưởng hiệu suất", "Du lịch hàng năm", "Tài khoản manager", "API riêng"]
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Hoa Hồng Cao",
      description: "Tỷ lệ hoa hồng lên đến 60% - cao nhất thị trường"
    },
    {
      icon: TrendingUp,
      title: "Thanh Toán Nhanh",
      description: "Thanh toán hoa hồng hàng tuần, nhanh chóng và minh bạch"
    },
    {
      icon: Users,
      title: "Hỗ Trợ Chuyên Nghiệp", 
      description: "Đội ngũ hỗ trợ 24/7 và tài liệu marketing đầy đủ"
    },
    {
      icon: Award,
      title: "Thưởng Hiệu Suất",
      description: "Bonus đặc biệt cho đại lý có hiệu suất xuất sắc"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">CHƯƠNG TRÌNH ĐẠI LÝ</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Tham gia hệ thống đại lý của DINAMONDBET68 và nhận hoa hồng lên đến 60%
            </p>
            <Button size="lg" className="px-8 py-3">
              <Users className="w-5 h-5 mr-2" />
              Đăng Ký Ngay
            </Button>
          </div>
        </div>
      </section>

      {/* Commission Levels */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cấp Bậc Đại Lý</h2>
            <p className="text-lg text-muted-foreground">
              Hệ thống cấp bậc rõ ràng với mức hoa hồng hấp dẫn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commissionLevels.map((level, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto p-4 rounded-full ${level.color} mb-4`}>
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{level.level}</CardTitle>
                  <div className="text-3xl font-bold text-gradient">{level.commission}</div>
                  <Badge variant="secondary">{level.requirement}</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {level.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tại Sao Chọn Chúng Tôi?</h2>
            <p className="text-lg text-muted-foreground">
              Những lợi ích vượt trội khi trở thành đại lý của DINAMONDBET68
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="mx-auto p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cách Thức Hoạt Động</h2>
            <p className="text-lg text-muted-foreground">
              Quy trình đơn giản để trở thành đại lý của chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">Đăng Ký Tài Khoản</h3>
              <p className="text-muted-foreground">Tạo tài khoản đại lý và hoàn thành xác minh</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">Nhận Link Giới Thiệu</h3>
              <p className="text-muted-foreground">Nhận link và mã giới thiệu độc quyền của bạn</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">Nhận Hoa Hồng</h3>
              <p className="text-muted-foreground">Nhận hoa hồng hàng tuần từ người chơi bạn giới thiệu</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Liên Hệ Hỗ Trợ Đại Lý</CardTitle>
              <p className="text-muted-foreground">
                Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giải đáp mọi thắc mắc
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Hotline</h3>
                  <p className="text-muted-foreground">1900 xxxx</p>
                </div>
                <div className="text-center">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-muted-foreground">24/7 Support</p>
                </div>
                <div className="text-center">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">agent@dinamondbet68.com</p>
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

export default DaiLy;