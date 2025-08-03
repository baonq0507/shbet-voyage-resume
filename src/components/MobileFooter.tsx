import { Home, Users, Gift, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MobileFooter = () => {
  const location = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: "Trang chủ",
      path: "/",
    },
    {
      icon: Users,
      label: "Đại lý",
      path: "/agent",
    },
    {
      icon: Gift,
      label: "Khuyến Mại",
      path: "/promotions",
    },
    {
      icon: MessageCircle,
      label: "CSKH",
      path: "/support",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border shadow-2xl">
      <div className="grid grid-cols-4 h-16">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 py-2 transition-all duration-300 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "casino-glow" : ""}`} />
              <span className="text-xs font-medium leading-tight">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-b-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooter;