import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RAWGGame {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  genres: Array<{ name: string }>;
  platforms: Array<{ platform: { name: string } }>;
  released: string;
  metacritic: number;
}

interface GameResponse {
  id: number;
  name: string;
  image: string;
  rating: number;
  genre: string;
  platform: string;
  releaseDate: string;
  metacritic: number;
}

// Fake data as fallback
const fakeGamesData: GameResponse[] = [
  {
    id: 1,
    name: "The Legend of Zelda: Breath of the Wild",
    image: "https://via.placeholder.com/300x200?text=Zelda",
    rating: 4.8,
    genre: "Action, Adventure",
    platform: "Nintendo Switch, PC",
    releaseDate: "2017-03-03",
    metacritic: 97
  },
  {
    id: 2,
    name: "God of War",
    image: "https://via.placeholder.com/300x200?text=God+of+War",
    rating: 4.7,
    genre: "Action, Adventure",
    platform: "PlayStation, PC",
    releaseDate: "2018-04-20",
    metacritic: 94
  },
  {
    id: 3,
    name: "Cyberpunk 2077",
    image: "https://via.placeholder.com/300x200?text=Cyberpunk",
    rating: 4.2,
    genre: "RPG, Action",
    platform: "PC, PlayStation, Xbox",
    releaseDate: "2020-12-10",
    metacritic: 86
  },
  {
    id: 4,
    name: "Elden Ring",
    image: "https://via.placeholder.com/300x200?text=Elden+Ring",
    rating: 4.9,
    genre: "RPG, Action",
    platform: "PC, PlayStation, Xbox",
    releaseDate: "2022-02-25",
    metacritic: 96
  },
  {
    id: 5,
    name: "Spider-Man: Miles Morales",
    image: "https://via.placeholder.com/300x200?text=Spider-Man",
    rating: 4.6,
    genre: "Action, Adventure",
    platform: "PlayStation, PC",
    releaseDate: "2020-11-12",
    metacritic: 85
  }
];

async function fetchGamesFromRAWG(page: number = 1, pageSize: number = 10): Promise<GameResponse[]> {
  try {
    // RAWG API endpoint - free tier allows 20,000 requests per month
    const response = await fetch(
      `https://api.rawg.io/api/games?key=YOUR_API_KEY&page=${page}&page_size=${pageSize}&ordering=-rating`
    );

    if (!response.ok) {
      console.log('RAWG API failed, using fake data');
      return fakeGamesData.slice(0, pageSize);
    }

    const data = await response.json();
    
    return data.results.map((game: RAWGGame): GameResponse => ({
      id: game.id,
      name: game.name,
      image: game.background_image || "https://via.placeholder.com/300x200?text=No+Image",
      rating: game.rating || 0,
      genre: game.genres?.map(g => g.name).join(", ") || "Unknown",
      platform: game.platforms?.slice(0, 3).map(p => p.platform.name).join(", ") || "Unknown",
      releaseDate: game.released || "Unknown",
      metacritic: game.metacritic || 0
    }));
  } catch (error) {
    console.error('Error fetching from RAWG API:', error);
    console.log('Falling back to fake data');
    return fakeGamesData.slice(0, pageSize);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '10');
    const category = url.searchParams.get('category') || 'all'; // for future filtering

    console.log(`Fetching games - Page: ${page}, Size: ${pageSize}, Category: ${category}`);

    const games = await fetchGamesFromRAWG(page, pageSize);

    return new Response(
      JSON.stringify({
        success: true,
        data: games,
        pagination: {
          page,
          pageSize,
          total: games.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-games-list function:', error);
    
    // Return fake data as ultimate fallback
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch games',
        data: fakeGamesData.slice(0, 5), // Return some fake data
        fallback: true
      }),
      {
        status: 200, // Still return 200 but with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});