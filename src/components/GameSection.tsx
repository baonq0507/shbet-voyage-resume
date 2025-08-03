import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Star, Trophy, Gift } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  featured?: boolean;
}

const GameCard = ({ title, description, image, featured }: GameCardProps) => (
  <Card className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${
    featured ? "casino-glow border-primary" : ""
  }`}>
    <CardHeader className="pb-2">
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button variant="casino" size="lg">
            <Play className="w-5 h-5" />
            Chơi Ngay
          </Button>
        </div>
        {featured && (
          <div className="absolute top-2 right-2 bg-gradient-gold px-2 py-1 rounded text-xs font-bold text-black">
            HOT
          </div>
        )}
      </div>
      <CardTitle className="text-lg group-hover:text-primary transition-colors">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 fill-secondary text-secondary" />
          <span className="text-sm font-medium">4.8</span>
        </div>
        <Button variant="outline" size="sm">
          Xem Chi Tiết
        </Button>
      </div>
    </CardContent>
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
}

const GameSection = ({ title, lobbies, games }: GameSectionProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-gradient">{title}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        {lobbies && lobbies.length > 0 ? (
          <Tabs defaultValue={lobbies[0].id} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2 mb-8 h-auto p-2">
              {lobbies.map((lobby) => (
                <TabsTrigger 
                  key={lobby.id} 
                  value={lobby.id} 
                  className="flex flex-col items-center justify-center gap-2 p-4 h-auto min-h-[80px] text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <img 
                    src={lobby.logo} 
                    alt={lobby.name}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-center leading-tight">{lobby.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {lobbies.map((lobby) => (
              <TabsContent key={lobby.id} value={lobby.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {lobby.games.map((game, index) => (
                    <GameCard key={index} {...game} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : games && games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <GameCard key={index} {...game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Không có game nào để hiển thị</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="casino" size="lg" className="mr-4">
            <Trophy className="w-5 h-5" />
            Xem Tất Cả Game
          </Button>
          <Button variant="gold" size="lg">
            <Gift className="w-5 h-5" />
            Nhận Thưởng
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GameSection;