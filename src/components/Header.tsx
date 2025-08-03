import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Wallet, Bell, Home } from "lucide-react";
import casinoIcon from "@/assets/menu/casino.png";
import nohuIcon from "@/assets/menu/nohu.png";
import bancaIcon from "@/assets/menu/banca.png";
import thethaoIcon from "@/assets/menu/thethao.png";
import gamebaiIcon from "@/assets/menu/gamebai.png";
import dagaIcon from "@/assets/menu/daga.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "TRANG CHỦ", icon: Home },
    { path: "/casino", label: "CASINO", image: casinoIcon },
    { path: "/nohu", label: "NỔ HŨ", image: nohuIcon },
    { path: "/banca", label: "BẮN CÁ", image: bancaIcon },
    { path: "/thethao", label: "THỂ THAO", image: thethaoIcon },
    { path: "/gamebai", label: "GAME BÀI", image: gamebaiIcon },
    { path: "/daga", label: "ĐÁ GÀ", image: dagaIcon },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      {/* Top Banner */}
      <div className="bg-gradient-primary text-center py-2 text-sm text-primary-foreground">
        🎉 CHÀO MỪNG ĐẾN VỚI DINAMONDBET68 - NHÀ CÁI UY TÍN HÀNG ĐẦU VIỆT NAM 🎉
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center casino-glow">
              <span className="text-white font-bold text-xl">D68</span>
            </div>
            <div className="text-gradient font-bold text-xl">DINAMONDBET68</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground casino-glow"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {item.icon ? (
                  <item.icon className="w-4 h-4" />
                ) : item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.label}
                    className="w-4 h-4 object-contain"
                  />
                ) : null}
                <span>{item.label}</span>
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
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground casino-glow"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon ? (
                    <item.icon className="w-5 h-5" />
                  ) : item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.label}
                      className="w-5 h-5 object-contain"
                    />
                  ) : null}
                  <span>{item.label}</span>
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