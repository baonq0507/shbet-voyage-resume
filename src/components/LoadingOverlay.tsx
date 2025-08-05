import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  description?: string;
}

const LoadingOverlay = ({ 
  isVisible, 
  title = "Đang xử lý...", 
  description = "Vui lòng chờ trong giây lát" 
}: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-card border border-border rounded-lg p-8 shadow-2xl animate-scale-in">
        <div className="flex flex-col items-center gap-4">
          {/* Spinning loader */}
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          </div>
          
          {/* Title */}
          <div className="text-xl font-semibold text-foreground text-center">
            {title}
          </div>
          
          {/* Description */}
          <div className="text-sm text-muted-foreground text-center max-w-sm">
            {description}
          </div>
          
          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;