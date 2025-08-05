import { useState } from 'react';
import { useGamesList, Game } from '@/hooks/useGamesList';
import { useGameLogin } from '@/hooks/useGameLogin';
import { useGameFrame } from '@/hooks/useGameFrame';
import { LazyImage } from '@/components/ui/lazy-image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { menuItems } from '@/utils/menuItems';

interface CategoryGamesListProps {
  categoryId: string;
  title: string;
}

const CategoryGamesList = ({ categoryId, title }: CategoryGamesListProps) => {
  const categoryData = menuItems.find(item => item.id === categoryId);
  const providers = categoryData?.dropdown || [];
  
  const [selectedProvider, setSelectedProvider] = useState<number | null>(
    providers.length > 0 ? Number(providers[0].id) : null
  );
  
  const { games, loading, error } = useGamesList(1, 50, 'all', selectedProvider ? [selectedProvider] : []);
  const { loginToGame } = useGameLogin();
  const { openGame } = useGameFrame();

  const handleGameClick = async (game: Game) => {
    try {
      const isThethaoGame = game.type?.toLowerCase().includes('sport') || game.category?.toLowerCase().includes('sport');
      const gameId = Number(game.id);
      
      if (isThethaoGame) {
        const loginResult = await loginToGame(gameId, true);
        if (loginResult) {
          window.open(loginResult, '_blank');
        }
      } else {
        const loginResult = await loginToGame(gameId, false);
        if (loginResult) {
          openGame(loginResult);
        }
      }
    } catch (error) {
      console.error('Error launching game:', error);
    }
  };

  if (!categoryData) {
    return <div>Category not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Provider Categories */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-card rounded-lg p-4 space-y-2">
            <h3 className="font-semibold mb-4 text-sm text-muted-foreground">DANH MỤC</h3>
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(Number(provider.id))}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                  selectedProvider === provider.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="w-8 h-8 flex-shrink-0">
                  <img 
                    src={provider.icon} 
                    alt={provider.text}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <span className="text-sm font-medium">{provider.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Games Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="w-full aspect-square" />
                    <div className="p-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Có lỗi xảy ra khi tải game</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không có game nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {games.map((game) => (
                <Card 
                  key={game.id} 
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => handleGameClick(game)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden">
                      <LazyImage
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Chơi Ngay
                        </Button>
                      </div>
                      {game.rank && game.rank <= 3 && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                          #{game.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm mb-1 line-clamp-1">{game.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{game.provider}</span>
                        <Badge 
                          variant={game.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {game.isActive ? "Hoạt động" : "Bảo trì"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryGamesList;