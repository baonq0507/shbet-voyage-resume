import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Menu } from "lucide-react";
import { useGameFrame } from "@/hooks/useGameFrame";
import { useGameLogin } from "@/hooks/useGameLogin";
import { useState } from "react";

const GameFrame = () => {
  const { gameUrl, closeGame } = useGameFrame();
  const { loading: gameLoading } = useGameLogin();
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Show loading overlay when logging in or iframe is loading
  const showLoading = gameLoading || isIframeLoading;

  if (!gameUrl) {
    // Show full screen loading when game is being loaded but no URL yet
    if (gameLoading) {
      return (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-lg font-medium">Đang đăng nhập game...</div>
            <div className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát</div>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
    // Auto hide header after game loads
    setTimeout(() => {
      setIsHeaderVisible(false);
    }, 3000);
  };

  const handleIframeError = () => {
    setIsIframeLoading(false);
  };

  const handleBackClick = () => {
    setIsIframeLoading(true);
    setIsHeaderVisible(true);
    closeGame();
  };

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header - can be hidden */}
      <div 
        className={`absolute top-0 left-0 right-0 z-20 transition-transform duration-300 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 bg-card border-b border-border backdrop-blur-md bg-card/95">
          <Button
            onClick={handleBackClick}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={gameLoading}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {showLoading ? 'Đang tải game...' : 'Game đang chạy'}
          </div>
        </div>
      </div>

      {/* Toggle header button - floating button */}
      {!isHeaderVisible && (
        <Button
          onClick={toggleHeader}
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-30 bg-card/95 backdrop-blur-md border-border hover:bg-card"
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}

      {/* Loading Overlay */}
      {showLoading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-lg font-medium">
              {gameLoading ? 'Đang đăng nhập game...' : 'Đang tải game...'}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              {gameLoading 
                ? 'Đang xác thực và kết nối với server game' 
                : 'Game sẽ hiển thị trong giây lát'
              }
            </div>
          </div>
        </div>
      )}

      {/* Game iframe - full screen when header is hidden */}
      <iframe
        src={gameUrl}
        className={`w-full border-0 transition-all duration-300 ${
          isHeaderVisible ? 'h-[calc(100vh-73px)] mt-[73px]' : 'h-screen mt-0'
        }`}
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