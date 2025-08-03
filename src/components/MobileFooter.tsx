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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Background with gradient and blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/95 to-card/90 backdrop-blur-md border-t-2 border-primary/30 shadow-2xl">
        {/* Decorative top border gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
        {/* Subtle glow effect */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-primary/20 blur-xl rounded-full"></div>
      </div>
      
      <div className="relative grid grid-cols-4 h-16 px-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 transition-all duration-300 rounded-t-xl m-1 ${
                isActive
                  ? "text-white bg-gradient-to-t from-primary to-primary/80 casino-glow shadow-lg scale-105"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10 hover:scale-105"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Active background glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-primary-glow/50 to-transparent rounded-t-xl blur-sm"></div>
              )}
              
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${
                  isActive ? "scale-110 drop-shadow-lg" : "group-hover:scale-110"
                }`} />
                <span className={`text-xs font-bold leading-tight transition-all duration-300 ${
                  isActive ? "text-white drop-shadow-sm" : ""
                }`}>
                  {item.label}
                </span>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-secondary via-yellow-400 to-secondary rounded-b-full shadow-md animate-pulse"></div>
              )}
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-t-xl"></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooter;