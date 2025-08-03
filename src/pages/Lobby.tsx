import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Users, ArrowLeft, Filter } from "lucide-react";

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
  
  useEffect(() => {
    if (!lobbyData) {
      navigate('/');
    }
  }, [lobbyData, navigate]);

  if (!lobbyData) {
    return null;
  }

  // Filter games by type
  const gameTypes = ['all', ...Array.from(new Set(lobbyData.games.map(game => game.type)))];
  const filteredGames = selectedType === 'all' 
    ? lobbyData.games 
    : lobbyData.games.filter(game => game.type === selectedType);

  const handlePlayGame = (gameId: number) => {
    // Placeholder for game launch logic
    console.log(`Launching game ${gameId}`);
  };

  return (
    <div className="min-h-screen bg-background">
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

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{game.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {game.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{game.rating}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Game Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{game.players} đang chơi</span>
                    </div>
                    <div className="text-primary font-bold">
                      Jackpot: {game.jackpot}
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  <Button 
                    className="w-full" 
                    onClick={() => handlePlayGame(game.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Chơi ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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