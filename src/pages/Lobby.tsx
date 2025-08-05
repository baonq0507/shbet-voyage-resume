import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Users, ArrowLeft, Filter } from "lucide-react";
import { useGamesList, type Game } from "@/hooks/useGamesList";
import Header from "@/components/Header";

// Define types for static games and API games
type StaticGame = {
  id: number;
  name: string;
  type: string;
  players: number;
  rating: number;
  jackpot: string;
};

// Game data for different lobbies
const gameData = {
  'evolution-gaming': {
    name: 'Evolution Gaming',
    category: 'Live Casino',
    description: 'Nhà cung cấp casino trực tuyến hàng đầu thế giới với chất lượng HD',
    games: [
      { id: 1, name: 'Lightning Roulette', type: 'Roulette', players: 245, rating: 4.8, jackpot: '2.5M' },
      { id: 2, name: 'Crazy Time', type: 'Game Show', players: 892, rating: 4.9, jackpot: '5.2M' },
      { id: 3, name: 'Monopoly Live', type: 'Game Show', players: 567, rating: 4.7, jackpot: '3.1M' },
      { id: 4, name: 'Dream Catcher', type: 'Game Show', players: 234, rating: 4.6, jackpot: '1.8M' },
      { id: 5, name: 'Lightning Blackjack', type: 'Blackjack', players: 156, rating: 4.8, jackpot: '850K' },
      { id: 6, name: 'Speed Baccarat', type: 'Baccarat', players: 189, rating: 4.5, jackpot: '920K' },
    ]
  },
  'pragmatic-play-live': {
    name: 'Pragmatic Play Live',
    category: 'Live Casino',
    description: 'Casino trực tuyến chất lượng cao với công nghệ tiên tiến',
    games: [
      { id: 7, name: 'Mega Wheel', type: 'Game Show', players: 445, rating: 4.7, jackpot: '2.8M' },
      { id: 8, name: 'Sweet Bonanza CandyLand', type: 'Game Show', players: 623, rating: 4.8, jackpot: '4.1M' },
      { id: 9, name: 'Pragmatic Roulette', type: 'Roulette', players: 312, rating: 4.6, jackpot: '1.9M' },
      { id: 10, name: 'Speed Blackjack', type: 'Blackjack', players: 198, rating: 4.5, jackpot: '1.2M' },
    ]
  },
  'playtech': {
    name: 'Playtech',
    category: 'Live Casino',
    description: 'Nhà cung cấp game uy tín với nhiều năm kinh nghiệm',
    games: [
      { id: 11, name: 'Age of Gods Roulette', type: 'Roulette', players: 267, rating: 4.7, jackpot: '3.4M' },
      { id: 12, name: 'Buffalo Blitz Live', type: 'Game Show', players: 189, rating: 4.6, jackpot: '2.1M' },
      { id: 13, name: 'Quantum Roulette', type: 'Roulette', players: 156, rating: 4.8, jackpot: '1.7M' },
    ]
  },
  'pragmatic-slots': {
    name: 'Pragmatic Slots',
    category: 'Slot Games',
    description: 'Game slot đa dạng với tỷ lệ thắng cao',
    games: [
      { id: 14, name: 'Sweet Bonanza', type: 'Slot', players: 789, rating: 4.9, jackpot: '12.5M' },
      { id: 15, name: 'The Dog House', type: 'Slot', players: 567, rating: 4.7, jackpot: '8.9M' },
      { id: 16, name: 'Great Rhino Megaways', type: 'Slot', players: 445, rating: 4.6, jackpot: '6.7M' },
      { id: 17, name: 'Wolf Gold', type: 'Slot', players: 334, rating: 4.8, jackpot: '9.2M' },
    ]
  },
  'microgaming': {
    name: 'Microgaming',
    category: 'Slot Games',
    description: 'Nổ hũ khủng với jackpot triệu đô',
    games: [
      { id: 18, name: 'Mega Moolah', type: 'Progressive Slot', players: 1234, rating: 4.9, jackpot: '18.7M' },
      { id: 19, name: 'Immortal Romance', type: 'Slot', players: 445, rating: 4.8, jackpot: '5.4M' },
      { id: 20, name: 'Thunderstruck II', type: 'Slot', players: 356, rating: 4.7, jackpot: '4.2M' },
    ]
  },
  'netent': {
    name: 'NetEnt',
    category: 'Slot Games', 
    description: 'Slot hiện đại với đồ họa tuyệt đẹp',
    games: [
      { id: 21, name: 'Starburst', type: 'Slot', players: 678, rating: 4.8, jackpot: '7.8M' },
      { id: 22, name: 'Gonzo\'s Quest', type: 'Slot', players: 445, rating: 4.7, jackpot: '6.1M' },
      { id: 23, name: 'Dead or Alive 2', type: 'Slot', players: 334, rating: 4.9, jackpot: '8.9M' },
    ]
  }
};

const Lobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Get lobby name from query parameter
  const urlParams = new URLSearchParams(location.search);
  const lobbySlug = urlParams.get('sanh') || '';
  
  // Get lobby data
  const lobbyData = gameData[lobbySlug as keyof typeof gameData];
  
  // Map lobby to API category
  const getApiCategory = (lobbySlug: string) => {
    const categoryMap: Record<string, string> = {
      'evolution-gaming': 'live-casino',
      'pragmatic-play-live': 'live-casino',
      'playtech': 'live-casino',
      'pragmatic-slots': 'slots',
      'microgaming': 'slots',
      'netent': 'slots'
    };
    return categoryMap[lobbySlug] || 'all';
  };

  // Call API for games
  const { games: apiGames, loading: apiLoading, error: apiError } = useGamesList(
    1, 
    12, 
    getApiCategory(lobbySlug)
  );
  
  useEffect(() => {
    if (!lobbyData) {
      navigate('/');
    }
  }, [lobbyData, navigate]);

  if (!lobbyData) {
    return null;
  }

  // Use API games if available, otherwise fallback to static data
  const gamesToShow: (Game | StaticGame)[] = apiGames.length > 0 ? apiGames : lobbyData.games;
  
  // Filter games by type
  const gameTypes = ['all', ...Array.from(new Set(gamesToShow.map(game => {
    if ('type' in game && game.type) {
      return game.type;
    } else if ('category' in game && game.category) {
      return game.category;
    } else {
      return 'Game';
    }
  })))];
  
  const filteredGames = selectedType === 'all' 
    ? gamesToShow 
    : gamesToShow.filter(game => {
        let gameType: string;
        if ('type' in game && game.type) {
          gameType = game.type;
        } else if ('category' in game && game.category) {
          gameType = game.category;
        } else {
          gameType = 'Game';
        }
        return gameType === selectedType;
      });

  const handlePlayGame = (gameId: number) => {
    // Placeholder for game launch logic
    console.log(`Launching game ${gameId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary via-secondary to-primary text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{lobbyData.name}</h1>
            <Badge variant="secondary" className="mb-4">
              {lobbyData.category}
            </Badge>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {lobbyData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {gameTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type === 'all' ? 'Tất cả' : type}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {apiLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted"></div>
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Games Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredGames.map((game, index) => (
              <Card key={'id' in game ? game.id : index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                {/* Game Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={'image' in game ? game.image : "https://via.placeholder.com/300x200?text=Game"} 
                    alt={'name' in game ? game.name : 'Game'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                  {/* Game type badge */}
                  <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                    {'type' in game && game.type ? game.type : ('category' in game && game.category ? game.category : 'Game')}
                  </Badge>
                </div>
                
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm line-clamp-2 leading-tight">
                    {'name' in game ? game.name : 'Unknown Game'}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="px-3 pb-3">
                  <div className="space-y-2">
                    {/* Game Stats - Only players count */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>
                        {'players' in game ? `${game.players} chơi` : 'Online'}
                      </span>
                    </div>
                    
                    {/* Play Button - Smaller */}
                    <Button 
                      className="w-full h-8 text-xs" 
                      size="sm"
                      onClick={() => handlePlayGame('id' in game ? Number(game.id) : index)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Chơi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy game nào cho loại "{selectedType}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;