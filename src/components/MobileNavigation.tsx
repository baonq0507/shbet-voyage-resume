import { Link, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { menuItems } from "@/utils/menuItems";

const MobileNavigation = () => {
  const location = useLocation();

  // Get navigation items from menuItems configuration
  const navItems = menuItems.map(item => ({
    path: item.path || `/${item.id}`,
    label: item.text,
    icon: item.icon,
    id: item.id
  }));

  return (
    <div className="lg:hidden bg-card/95 backdrop-blur-sm border-b border-border/50 py-2 relative">
      <div className="md:flex md:justify-center overflow-x-auto scrollbar-hide touch-pan-x">
        <div className="flex space-x-2 md:space-x-4 px-3 md:px-6 w-max md:justify-center md:mx-auto">
          {navItems.map((item) => {
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
                <div className="w-5 h-5 mb-1 flex items-center justify-center">
                  <img 
                    src={item.icon} 
                    alt={item.label}
                    className="w-full h-full object-contain"
                  />
                </div>
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