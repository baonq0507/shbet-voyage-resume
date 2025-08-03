import { useState } from 'react';
import { useGamesList } from '@/hooks/useGamesList';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Star, Calendar, Monitor } from 'lucide-react';

export const GamesList = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const { games, loading, error, pagination, refetch } = useGamesList(page, pageSize);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Lỗi tải dữ liệu</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Danh sách Game</h1>
          <p className="text-muted-foreground">
            Hiển thị {games.length} game từ API
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={game.image} 
                alt={game.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              {game.metacritic > 0 && (
                <Badge 
                  className="absolute top-2 right-2" 
                  variant={game.metacritic >= 80 ? "default" : "secondary"}
                >
                  {game.metacritic}
                </Badge>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{game.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{game.rating.toFixed(1)}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="w-4 h-4" />
                <span className="line-clamp-1">{game.platform}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{game.releaseDate}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {game.genre.split(', ').slice(0, 2).map((genre, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
            
            <CardFooter>
              <Button className="w-full" size="sm">
                Xem chi tiết
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button 
          variant="outline" 
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Trang trước
        </Button>
        <span className="px-4 py-2 text-sm">
          Trang {page}
        </span>
        <Button 
          variant="outline"
          onClick={() => setPage(page + 1)}
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
};