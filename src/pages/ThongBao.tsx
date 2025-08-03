import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Star, AlertTriangle, Info, Gift, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ThongBao = () => {
  const notifications = [
    {
      id: 1,
      type: "urgent",
      title: "Bảo Trì Hệ Thống",
      content: "Hệ thống sẽ được bảo trì từ 2:00 - 4:00 sáng ngày 15/12. Trong thời gian này, một số tính năng có thể bị gián đoạn. Chúng tôi xin lỗi vì sự bất tiện này.",
      time: "2 giờ trước",
      icon: AlertTriangle,
      color: "bg-red-500",
      badge: "Khẩn Cấp"
    },
    {
      id: 2,
      type: "promotion",
      title: "Khuyến Mại Cuối Tuần",
      content: "Nhận ngay 50% bonus khi nạp tiền vào cuối tuần. Chương trình áp dụng từ 00:00 thứ 7 đến 23:59 chủ nhật. Đừng bỏ lỡ cơ hội tuyệt vời này!",
      time: "5 giờ trước",
      icon: Gift,
      color: "bg-green-500",
      badge: "Khuyến Mại"
    },
    {
      id: 3,
      type: "update",
      title: "Cập Nhật Tính Năng Mới",
      content: "Chúng tôi đã thêm tính năng Live Chat 24/7 để hỗ trợ khách hàng tốt hơn. Bạn có thể truy cập Live Chat ở góc dưới bên phải màn hình.",
      time: "1 ngày trước",
      icon: Zap,
      color: "bg-blue-500",
      badge: "Cập Nhật"
    },
    {
      id: 4,
      type: "info",
      title: "Thay Đổi Giờ Hỗ Trợ",
      content: "Từ ngày 10/12, đội ngũ hỗ trợ khách hàng sẽ làm việc 24/7. Bạn có thể liên hệ chúng tôi bất cứ lúc nào qua Hotline hoặc Live Chat.",
      time: "2 ngày trước",
      icon: Info,
      color: "bg-yellow-500",
      badge: "Thông Tin"
    },
    {
      id: 5,
      type: "event",
      title: "Giải Đấu Tháng 12",
      content: "Tham gia giải đấu Casino tháng 12 với tổng giải thưởng lên đến 1 tỷ VNĐ. Đăng ký ngay để không bỏ lỡ cơ hội trở thành nhà vô địch!",
      time: "3 ngày trước",
      icon: Star,
      color: "bg-purple-500",
      badge: "Sự Kiện"
    },
    {
      id: 6,
      type: "security",
      title: "Bảo Mật Tài Khoản",
      content: "Để đảm bảo an toàn tài khoản, vui lòng không chia sẻ thông tin đăng nhập với bất kỳ ai. Hãy thay đổi mật khẩu định kỳ và bật xác thực 2 yếu tố.",
      time: "1 tuần trước",
      icon: AlertTriangle,
      color: "bg-orange-500",
      badge: "Bảo Mật"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "destructive";
      case "promotion":
        return "default";
      case "update":
        return "secondary";
      case "info":
        return "outline";
      case "event":
        return "default";
      case "security":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">THÔNG BÁO</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Cập nhật thông tin mới nhất từ DINAMONDBET68
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="py-6">
                <div className="text-2xl font-bold text-red-500 mb-1">1</div>
                <div className="text-sm text-muted-foreground">Thông báo khẩn cấp</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-6">
                <div className="text-2xl font-bold text-green-500 mb-1">2</div>
                <div className="text-sm text-muted-foreground">Khuyến mại mới</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-6">
                <div className="text-2xl font-bold text-blue-500 mb-1">2</div>
                <div className="text-sm text-muted-foreground">Cập nhật hệ thống</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-6">
                <div className="text-2xl font-bold text-purple-500 mb-1">1</div>
                <div className="text-sm text-muted-foreground">Sự kiện đặc biệt</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Tất Cả Thông Báo</h2>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Đánh dấu đã đọc
              </Button>
            </div>
            
            <div className="space-y-4">
              {notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <Card key={notification.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${notification.color}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                              {notification.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={getTypeColor(notification.type)}>
                                {notification.badge}
                              </Badge>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground leading-relaxed">
                        {notification.content}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Xem Thêm Thông Báo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Cài Đặt Thông Báo</CardTitle>
              <p className="text-muted-foreground">
                Tùy chỉnh cách bạn nhận thông báo từ chúng tôi
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Thông báo khuyến mại</h3>
                    <p className="text-sm text-muted-foreground">Nhận thông báo về các chương trình khuyến mại mới</p>
                  </div>
                  <Button variant="outline" size="sm">Bật</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Thông báo hệ thống</h3>
                    <p className="text-sm text-muted-foreground">Nhận thông báo về bảo trì và cập nhật hệ thống</p>
                  </div>
                  <Button variant="outline" size="sm">Bật</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Thông báo sự kiện</h3>
                    <p className="text-sm text-muted-foreground">Nhận thông báo về các sự kiện và giải đấu</p>
                  </div>
                  <Button variant="outline" size="sm">Bật</Button>
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

export default ThongBao;