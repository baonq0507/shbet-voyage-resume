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
    <div className="md:hidden bg-card border-b border-border py-3 relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center min-w-[80px] px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground casino-glow"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium text-center whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
      
      {/* Scroll Indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="bg-gradient-to-l from-card via-card/80 to-transparent w-8 h-full absolute -left-6 top-0" />
        <ChevronRight className="w-4 h-4 text-muted-foreground animate-pulse" />
      </div>
    </div>
  );
};

export default MobileNavigation;