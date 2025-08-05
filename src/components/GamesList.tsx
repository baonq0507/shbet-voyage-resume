import { useState } from 'react';
import { useGamesList } from '@/hooks/useGamesList';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Gamepad2, Tag, Crown, Building2 } from 'lucide-react';
import { LazyImage } from '@/components/ui/lazy-image';

export const GamesList = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const { games, loading, error, pagination, apiUsed, refetch } = useGamesList(page, pageSize);

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
            Hiển thị {games.length} game {apiUsed ? 'từ API' : '(dữ liệu dự phòng)'}
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
              <LazyImage 
                src={game.image} 
                alt={game.name}
                className="w-full h-full object-cover"
                onError={() => {
                  // Error handling is built into LazyImage component
                }}
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {game.isActive ? (
                  <Badge variant="default" className="text-xs">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Không hoạt động
                  </Badge>
                )}
                {game.rank <= 3 && (
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Top {game.rank}
                  </Badge>
                )}
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{game.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Gamepad2 className="w-4 h-4" />
                <span>{game.type}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span className="line-clamp-1">{game.provider}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="line-clamp-1">{game.category}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {game.type}
                </Badge>
                {game.category !== game.type && (
                  <Badge variant="outline" className="text-xs">
                    {game.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Rank #{game.rank}
                </Badge>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button className="w-full" size="sm" disabled={!game.isActive}>
                {game.isActive ? 'Chơi ngay' : 'Không khả dụng'}
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