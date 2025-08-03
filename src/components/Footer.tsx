import { Button } from "@/components/ui/button";
import { Facebook, MessageCircle, Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center casino-glow">
                <span className="text-white font-bold text-xl">SH</span>
              </div>
              <div className="text-gradient font-bold text-xl">SHBET</div>
            </div>
            <p className="text-muted-foreground mb-4">
              Nhà cái uy tín hàng đầu Việt Nam với hơn 10 năm kinh nghiệm trong lĩnh vực cá cược trực tuyến.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gradient">Liên Kết Nhanh</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Giới Thiệu</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Điều Khoản</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Chính Sách</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Bảo Mật</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Hướng Dẫn</a></li>
            </ul>
          </div>

          {/* Games */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gradient">Sản Phẩm Game</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Casino Trực Tuyến</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Thể Thao</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Nổ Hũ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Bắn Cá</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Đá Gà</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gradient">Liên Hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>1900-xxxx</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@shbet.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Việt Nam</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>24/7 Hỗ Trợ</span>
              </div>
            </div>
            <Button variant="casino" className="mt-4 w-full">
              Liên Hệ Ngay
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 SHBET. Tất cả quyền được bảo lưu. Chơi có trách nhiệm.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;