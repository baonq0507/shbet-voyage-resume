import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Wallet, Bell, Home, Coins, Zap, Fish, Trophy, Spade, Bird } from "lucide-react";
import casinoIcon from "@/assets/menu/casino-green.png";
import nohuIcon from "@/assets/menu/nohu-green.png";
import bancaIcon from "@/assets/menu/banca-green.png";
import thethaoIcon from "@/assets/menu/thethao-green.png";
import gamebaiIcon from "@/assets/menu/gamebai-green.png";
import dagaIcon from "@/assets/menu/daga-green.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "TRANG CHỦ", icon: Home },
    { path: "/casino", label: "CASINO", icon: Coins },
    { path: "/nohu", label: "NỔ HŨ", icon: Zap },
    { path: "/banca", label: "BẮN CÁ", icon: Fish },
    { path: "/thethao", label: "THỂ THAO", icon: Trophy },
    { path: "/gamebai", label: "GAME BÀI", icon: Spade },
    { path: "/daga", label: "ĐÁ GÀ", icon: Bird },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      {/* Top Banner */}
      {/* Welcome Banner */}
      <section className="relative py-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide-in-right"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-lg md:text-xl lg:text-2xl font-black text-white animate-fade-in">
              <span className="inline-block animate-pulse mr-2">🎉</span>
              <span className="text-shadow-lg tracking-wide">
                CHÀO MỪNG ĐẾN VỚI 
                <span className="text-yellow-300 mx-2 font-extrabold text-xl md:text-2xl lg:text-3xl">
                  DINAMONDBET68
                </span>
                - NHÀ CÁI UY TÍN HÀNG ĐẦU VIỆT NAM
              </span>
              <span className="inline-block animate-pulse ml-2">🎉</span>
            </h1>
          </div>
        </div>
      </section>

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
                {item.icon && (
                  <item.icon className="w-4 h-4" />
                )}
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
                  {item.icon && (
                    <item.icon className="w-5 h-5" />
                  )}
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