import { Link, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Zap, Fish, Trophy, Spade, Bird, ChevronRight } from "lucide-react";

const MobileNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/casino", label: "CASINO", icon: Coins },
    { path: "/nohu", label: "NỔ HŨ", icon: Zap },
    { path: "/banca", label: "BẮN CÁ", icon: Fish },
    { path: "/thethao", label: "THỂ THAO", icon: Trophy },
    { path: "/gamebai", label: "GAME BÀI", icon: Spade },
    { path: "/daga", label: "ĐÁ GÀ", icon: Bird },
  ];

  return (
    <div className="md:hidden bg-card/95 backdrop-blur-sm border-b border-border/50 py-2 relative">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-2 px-3 w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center min-w-[70px] px-2 py-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? "bg-gradient-primary text-white shadow-lg scale-105"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;