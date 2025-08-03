import { Button } from "@/components/ui/button";
import { Facebook, MessageCircle, Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12 md:mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center casino-glow">
                <span className="text-white font-bold text-xl">D68</span>
              </div>
              <div className="text-gradient font-bold text-lg sm:text-xl">DINAMONDBET68</div>
            </div>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Nhà cái uy tín hàng đầu Việt Nam với hơn 10 năm kinh nghiệm trong lĩnh vực cá cược trực tuyến.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
                <Facebook className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 md:mb-4 text-gradient">Liên Kết Nhanh</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Giới Thiệu</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Điều Khoản</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Chính Sách</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Bảo Mật</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Hướng Dẫn</a></li>
            </ul>
          </div>

          {/* Games */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 md:mb-4 text-gradient">Sản Phẩm Game</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Casino Trực Tuyến</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Thể Thao</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Nổ Hũ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Bắn Cá</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">Đá Gà</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 md:mb-4 text-gradient">Liên Hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground text-sm sm:text-base">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>1900-xxxx</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground text-sm sm:text-base">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-all">support@dinamondbet68.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground text-sm sm:text-base">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Việt Nam</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground text-sm sm:text-base">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>24/7 Hỗ Trợ</span>
              </div>
            </div>
            <Button variant="casino" className="mt-4 w-full text-sm sm:text-base">
              Liên Hệ Ngay
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8 text-center text-muted-foreground">
          <p className="text-xs sm:text-sm">&copy; 2024 DINAMONDBET68. Tất cả quyền được bảo lưu. Chơi có trách nhiệm.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;