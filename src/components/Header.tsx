import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Wallet, Bell } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "TRANG CHỦ" },
    { path: "/casino", label: "CASINO" },
    { path: "/nohu", label: "NỔ HŨ" },
    { path: "/banca", label: "BẮN CÁ" },
    { path: "/thethao", label: "THỂ THAO" },
    { path: "/gamebai", label: "GAME BÀI" },
    { path: "/daga", label: "ĐÁ GÀ" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      {/* Top Banner */}
      <div className="bg-gradient-primary text-center py-2 text-sm text-white">
        🎉 CHÀO MỪNG ĐẾN VỚI SHBET - NHÀ CÁI UY TÍN HÀNG ĐẦU VIỆT NAM 🎉
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center casino-glow">
              <span className="text-white font-bold text-xl">SH</span>
            </div>
            <div className="text-gradient font-bold text-xl">SHBET</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground casino-glow"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="hidden lg:flex">
              <Bell className="w-4 h-4" />
              Thông Báo
            </Button>
            <Button variant="casino" size="sm">
              <User className="w-4 h-4" />
              Đăng Nhập
            </Button>
            <Button variant="gold" size="sm">
              <Wallet className="w-4 h-4" />
              Nạp Tiền
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground casino-glow"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;