import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Star, Trophy, Gift, Globe } from "lucide-react";
import { useGamesList } from "@/hooks/useGamesList";
import { LazyImage } from "@/components/ui/lazy-image";
import { useGameLogin } from "@/hooks/useGameLogin";
import { useGameFrame } from "@/hooks/useGameFrame";
import { getRandomGPID } from "@/config/gameConfig";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  featured?: boolean;
  onClick?: () => void;
}

const GameCard = ({ title, description, image, featured, onClick }: GameCardProps) => (
  <Card 
    className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 border-2 overflow-hidden ${
      featured ? "casino-glow border-primary shadow-2xl" : "border-border/50 hover:border-primary/50"
    } bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm rounded-xl`}
    onClick={onClick}
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
          <Button variant="casino" size="sm" className="text-xs sm:text-sm transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl pointer-events-none">
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

interface CasinoLobby {
  id: string;
  name: string;
  logo: string;
  games: Array<{
    title: string;
    description: string;
    image: string;
    featured?: boolean;
  }>;
}

interface GameSectionProps {
  title: string;
  lobbies?: CasinoLobby[];
  games?: Array<{
    title: string;
    description: string;
    image: string;
    featured?: boolean;
  }>;
  showApiGames?: boolean;
  defaultCategory?: string;
  gpids?: number[];
}

const GameSection = ({ title, lobbies, games, showApiGames, defaultCategory, gpids }: GameSectionProps) => {
  const [activeTab, setActiveTab] = useState<string>(showApiGames ? "api-games" : lobbies?.[0]?.id || "");
  const { loginToGame } = useGameLogin();
  const { openGame } = useGameFrame();
  
  // Map lobby IDs to API categories
  const getCategoryForTab = (tabId: string) => {
    // If defaultCategory is provided (for dedicated pages), use it
    if (defaultCategory && tabId === "api-games") {
      return defaultCategory;
    }
    
    const categoryMap: Record<string, string> = {
      "api-games": "all",
      "evo": "live-casino",
      "pragmatic": "slots", 
      "playtech": "slots",
      "microgaming": "slots",
      "netent": "slots",
      "sports": "sports"
    };
    return categoryMap[tabId] || "all";
  };

  const { games: apiGames, loading: apiLoading } = useGamesList(1, 6, getCategoryForTab(activeTab), gpids);

  const handleGameClick = async (game: any) => {
    try {
      // Use game's gpid if available, otherwise use random GPID
      const gpid = game.gpid || getRandomGPID();
      const isThethao = getCategoryForTab(activeTab) === "sports";
      
      console.log('🎮 Clicking game:', game.name, 'with GPID:', gpid);
      
      const gameUrl = await loginToGame(gpid, isThethao);
      if (gameUrl) {
        openGame(gameUrl);
      }
    } catch (error) {
      console.error('Error launching game:', error);
    }
  };

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">{title}</span>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        {(lobbies && lobbies.length > 0) || showApiGames ? (
          <div className="relative border border-border/50 rounded-2xl p-2 sm:p-3 bg-gradient-to-br from-card/95 via-card to-muted/30 backdrop-blur-md shadow-2xl casino-glow">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full blur-xl"></div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
              {/* Scroll hint for mobile */}
              <div className="text-center text-xs text-muted-foreground mb-2 opacity-75 md:hidden">
                ← Vuốt để xem thêm →
              </div>
              
              <TabsList className="
                flex 
                justify-center
                overflow-x-auto overflow-y-hidden 
                scrollbar-hide
                gap-2 sm:gap-3 mb-4 sm:mb-6 h-auto p-1.5 
                bg-gradient-to-r from-primary/20 via-card/80 to-primary/20 
                border-2 border-primary/30 shadow-inner rounded-xl backdrop-blur-sm
                snap-x snap-mandatory
                scroll-smooth
                touch-pan-x
                [-webkit-overflow-scrolling:touch]
              ">
                {/* API Games Tab */}
                {showApiGames && (
                  <TabsTrigger 
                    value="api-games"
                    className="group flex flex-col items-center justify-center gap-0.5 p-1.5 sm:p-2 h-auto min-h-[50px] sm:min-h-[55px] text-xs font-semibold rounded-lg min-w-[70px] max-w-[90px] flex-shrink-0 snap-start
                      data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/90 
                      data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:casino-glow
                      hover:bg-gradient-to-br hover:from-primary/30 hover:to-primary/20 hover:scale-102 hover:shadow-md
                      transition-all duration-300 ease-out border border-transparent data-[state=active]:border-primary-glow/50
                      relative overflow-hidden"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="text-xs font-semibold">HOT NHẤT</span>
                    </div>
                    
                    {/* Active indicator */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-secondary to-primary rounded-full group-data-[state=active]:w-full transition-all duration-300"></div>
                  </TabsTrigger>
                )}
                
                {/* Category Tabs */}
                {lobbies && lobbies.map((lobby, index) => (
                  <TabsTrigger 
                    key={lobby.id} 
                    value={lobby.id} 
                    className="group flex items-center justify-center p-2 sm:p-3 h-auto min-h-[40px] sm:min-h-[45px] text-xs sm:text-sm font-semibold rounded-lg min-w-[80px] flex-shrink-0 snap-start
                      data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/90 
                      data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:casino-glow
                      hover:bg-gradient-to-br hover:from-primary/30 hover:to-primary/20 hover:scale-102 hover:shadow-md
                      transition-all duration-300 ease-out border border-transparent data-[state=active]:border-primary-glow/50
                      relative overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10 flex items-center">
                      <span className="text-center leading-tight">{lobby.name}</span>
                    </div>
                    
                    {/* Active indicator */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-secondary to-primary rounded-full group-data-[state=active]:w-full transition-all duration-300"></div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* API Games Tab Content */}
              {showApiGames && (
                <TabsContent value="api-games">
                  {apiLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="overflow-hidden animate-pulse">
                          <div className="h-24 sm:h-28 md:h-32 bg-muted"></div>
                          <CardHeader className="pb-2">
                            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                       {apiGames.map((game) => (
                         <GameCard 
                           key={game.id} 
                           title={game.name}
                           description={game.type || game.category || 'Game'}
                           image={game.image}
                           featured={game.isActive === true}
                           onClick={() => handleGameClick(game)}
                         />
                       ))}
                     </div>
                  )}
                </TabsContent>
              )}

              {/* Lobby Tab Content - Now also using API data */}
              {lobbies && lobbies.map((lobby) => (
                <TabsContent key={lobby.id} value={lobby.id}>
                  {activeTab === lobby.id && apiLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="overflow-hidden animate-pulse">
                          <div className="h-24 sm:h-28 md:h-32 bg-muted"></div>
                          <CardHeader className="pb-2">
                            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : activeTab === lobby.id && apiGames.length > 0 ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                       {apiGames.map((game) => (
                         <GameCard 
                           key={game.id} 
                           title={game.name}
                           description={game.type || game.category || 'Game'}
                           image={game.image}
                           featured={game.isActive === true}
                           onClick={() => handleGameClick(game)}
                         />
                       ))}
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                       {lobby.games.map((game, index) => (
                          <GameCard key={index} {...game} onClick={() => handleGameClick({ ...game, gpid: null })} />
                       ))}
                     </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : games && games.length > 0 ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
             {games.map((game, index) => (
               <GameCard key={index} {...game} onClick={() => handleGameClick({ ...game, gpid: null })} />
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

export default GameSection;