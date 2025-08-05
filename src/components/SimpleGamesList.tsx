import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Star, Trophy, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGamesList } from "@/hooks/useGamesList";
import { useGameLogin } from "@/hooks/useGameLogin";
import { useGameFrame } from "@/hooks/useGameFrame";
import { LazyImage } from "@/components/ui/lazy-image";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  featured?: boolean;
  onClick?: () => void;
}

const GameCard = ({ title, description, image, featured, onClick }: GameCardProps) => (
  <Card 
    onClick={onClick}
    className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 border-2 overflow-hidden ${
      featured ? "casino-glow border-primary shadow-2xl" : "border-border/50 hover:border-primary/50"
    } bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm rounded-xl`}
  >
    <CardHeader className="p-2 sm:p-3">
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <LazyImage 
          src={image} 
          alt={title}
          className="w-full h-24 sm:h-28 md:h-32 group-hover:scale-125 transition-transform duration-500"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Play button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <Button variant="casino" size="sm" className="text-xs sm:text-sm transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline ml-1">Chơi Ngay</span>
          </Button>
        </div>
        
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded-full text-xs font-bold text-black shadow-lg animate-pulse">
            <Star className="w-3 h-3 inline mr-1" />
            HOT
          </div>
        )}
        
        {/* Shine effect */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-45 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
      </div>
      
      <CardTitle className="text-xs sm:text-sm md:text-base font-semibold group-hover:text-primary transition-colors mt-3 text-center line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
        {title}
      </CardTitle>
    </CardHeader>
  </Card>
);

interface SimpleGamesListProps {
  title: string;
  category?: string;
  gpids?: number[];
  maxGames?: number;
}

const SimpleGamesList = ({ title, category = "all", gpids, maxGames = 12 }: SimpleGamesListProps) => {
  const { games, loading } = useGamesList(1, maxGames, category, gpids);
  const { loginToGame, loginToSportsGame } = useGameLogin();
  const { openGame } = useGameFrame();

  const handleGameClick = async (game: any) => {
    console.log('🎯 Game clicked:', game);
    
    // Xác định có phải sports game không
    const isSportsGame = category === 'sports' || game.category === 'sports';
    
    // Sử dụng gpid từ game hoặc random từ gpids nếu có
    const gameGpid = game.gpid || (gpids && gpids.length > 0 ? gpids[Math.floor(Math.random() * gpids.length)] : 1);
    
    console.log('🎮 Login params:', { gpid: gameGpid, isSports: isSportsGame });
    
    // Login vào game
    const gameUrl = isSportsGame 
      ? await loginToSportsGame(gameGpid)
      : await loginToGame(gameGpid);
    
    if (gameUrl) {
      console.log('✅ Opening game with URL:', gameUrl);
      openGame(gameUrl);
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">{title}</span>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {Array.from({ length: maxGames }).map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="h-24 sm:h-28 md:h-32 bg-muted"></div>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {games.map((game) => (
              <GameCard 
                key={game.id} 
                title={game.name}
                description={`${game.provider} - ${game.type}`}
                image={game.image}
                featured={game.rank <= 3}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Không có game nào để hiển thị</p>
          </div>
        )}

        <div className="text-center mt-8 md:mt-12">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button variant="casino" size="lg" className="w-full sm:w-auto">
              <Trophy className="w-5 h-5" />
              Xem Tất Cả Game
            </Button>
            <Button variant="gold" size="lg" className="w-full sm:w-auto">
              <Gift className="w-5 h-5" />
              Nhận Thưởng
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleGamesList;