import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MobileAuthButtonsProps {
  onAuthClick: () => void;
}

const MobileAuthButtons = ({ onAuthClick }: MobileAuthButtonsProps) => {
  const { user } = useAuth();

  // Ẩn nút nếu đã đăng nhập
  if (user) {
    return null;
  }
  return (
    <div className="lg:hidden bg-gradient-to-r from-primary/10 via-card/95 to-primary/10 backdrop-blur-sm border-b border-border/30 py-3 px-4">
      <div className="flex gap-3 justify-center max-w-sm mx-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-10 text-sm font-semibold border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          onClick={onAuthClick}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Đăng Nhập
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-10 text-sm font-semibold border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          onClick={onAuthClick}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Đăng Ký
        </Button>
      </div>
    </div>
  );
};

export default MobileAuthButtons;