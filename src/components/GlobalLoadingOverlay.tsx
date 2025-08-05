import { Loader2 } from "lucide-react";
import { useLoading } from "@/hooks/useLoading";

const GlobalLoadingOverlay = () => {
  const { isLoading, title, description } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-card border border-border rounded-lg p-6 shadow-2xl animate-scale-in max-w-sm mx-4">
        <div className="flex flex-col items-center gap-3">
          {/* Spinning loader */}
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-primary/20 rounded-full"></div>
          </div>
          
          {/* Title */}
          <div className="text-lg font-semibold text-foreground text-center">
            {title}
          </div>
          
          {/* Description */}
          <div className="text-sm text-muted-foreground text-center max-w-sm">
            {description}
          </div>
          
          {/* Animated dots */}
          <div className="flex space-x-1 mt-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;