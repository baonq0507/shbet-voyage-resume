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

// Fake data organized by category
const fakeGamesData: Record<string, GameResponse[]> = {
  "all": [
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
    }
  ],
  "live-casino": [
    {
      id: 10,
      name: "Live Baccarat VIP",
      image: "https://via.placeholder.com/300x200?text=Live+Baccarat",
      rating: 4.9,
      genre: "Live Casino",
      platform: "Web, Mobile",
      releaseDate: "2023-01-01",
      metacritic: 95
    },
    {
      id: 11,
      name: "Live Roulette Gold",
      image: "https://via.placeholder.com/300x200?text=Live+Roulette",
      rating: 4.8,
      genre: "Live Casino",
      platform: "Web, Mobile",
      releaseDate: "2023-01-01",
      metacritic: 93
    },
    {
      id: 12,
      name: "Live Blackjack Premium",
      image: "https://via.placeholder.com/300x200?text=Live+Blackjack",
      rating: 4.7,
      genre: "Live Casino",
      platform: "Web, Mobile",
      releaseDate: "2023-01-01",
      metacritic: 92
    }
  ],
  "slots": [
    {
      id: 20,
      name: "Sweet Bonanza Xmas",
      image: "https://via.placeholder.com/300x200?text=Sweet+Bonanza",
      rating: 4.6,
      genre: "Slot Machine",
      platform: "Web, Mobile",
      releaseDate: "2023-12-01",
      metacritic: 89
    },
    {
      id: 21,
      name: "Gates of Olympus 1000",
      image: "https://via.placeholder.com/300x200?text=Gates+Olympus",
      rating: 4.8,
      genre: "Slot Machine",
      platform: "Web, Mobile", 
      releaseDate: "2023-06-01",
      metacritic: 91
    },
    {
      id: 22,
      name: "Sugar Rush Ultimate",
      image: "https://via.placeholder.com/300x200?text=Sugar+Rush",
      rating: 4.5,
      genre: "Slot Machine",
      platform: "Web, Mobile",
      releaseDate: "2023-08-01",
      metacritic: 87
    }
  ],
  "sports": [
    {
      id: 30,
      name: "Football Manager 2024",
      image: "https://via.placeholder.com/300x200?text=Football+Manager",
      rating: 4.4,
      genre: "Sports, Simulation",
      platform: "PC, Mobile",
      releaseDate: "2023-11-01",
      metacritic: 85
    },
    {
      id: 31,
      name: "NBA 2K24",
      image: "https://via.placeholder.com/300x200?text=NBA+2K24",
      rating: 4.3,
      genre: "Sports",
      platform: "PC, PlayStation, Xbox",
      releaseDate: "2023-09-01",
      metacritic: 84
    },
    {
      id: 32,
      name: "FIFA 24",
      image: "https://via.placeholder.com/300x200?text=FIFA+24",
      rating: 4.2,
      genre: "Sports",
      platform: "PC, PlayStation, Xbox",
      releaseDate: "2023-09-29",
      metacritic: 82
    }
  ]
};

async function fetchGamesFromRAWG(page: number = 1, pageSize: number = 10, category: string = "all"): Promise<GameResponse[]> {
  try {
    // Map category to RAWG API tags if using real API
    const categoryTagMap: Record<string, string> = {
      "all": "",
      "live-casino": "casino",
      "slots": "slots",
      "sports": "sports"
    };
    
    const tag = categoryTagMap[category] || "";
    const apiUrl = `https://api.rawg.io/api/games?key=YOUR_API_KEY&page=${page}&page_size=${pageSize}&ordering=-rating${tag ? `&tags=${tag}` : ""}`;

    // RAWG API endpoint - free tier allows 20,000 requests per month
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.log(`RAWG API failed for category ${category}, using fake data`);
      return fakeGamesData[category]?.slice(0, pageSize) || fakeGamesData["all"].slice(0, pageSize);
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
    console.error(`Error fetching from RAWG API for category ${category}:`, error);
    console.log('Falling back to fake data');
    return fakeGamesData[category]?.slice(0, pageSize) || fakeGamesData["all"].slice(0, pageSize);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let page = 1;
    let pageSize = 10;
    let category = 'all';

    // Handle both GET (URL params) and POST (body) requests
    if (req.method === 'POST') {
      const body = await req.json();
      page = body.page || 1;
      pageSize = body.pageSize || 10;
      category = body.category || 'all';
    } else {
      const url = new URL(req.url);
      page = parseInt(url.searchParams.get('page') || '1');
      pageSize = parseInt(url.searchParams.get('page_size') || '10');
      category = url.searchParams.get('category') || 'all';
    }

    console.log(`Fetching games - Page: ${page}, Size: ${pageSize}, Category: ${category}`);

    const games = await fetchGamesFromRAWG(page, pageSize, category);

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
        data: fakeGamesData["all"].slice(0, 5), // Return some fake data
        fallback: true
      }),
      {
        status: 200, // Still return 200 but with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});