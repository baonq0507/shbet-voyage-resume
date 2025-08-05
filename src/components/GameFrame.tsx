import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useGameFrame } from "@/hooks/useGameFrame";
import { useState } from "react";

const GameFrame = () => {
  const { gameUrl, closeGame } = useGameFrame();
  const [isLoading, setIsLoading] = useState(true);

  if (!gameUrl) return null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Back Button */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button
          onClick={closeGame}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Game đang chạy
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-sm text-muted-foreground">Đang tải game...</div>
          </div>
        </div>
      )}

      {/* Game iframe */}
      <iframe
        src={gameUrl}
        className="w-full h-[calc(100vh-73px)] border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Game"
        allow="fullscreen; autoplay; camera; microphone; geolocation"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation"
      />
    </div>
  );
};

export default GameFrame;