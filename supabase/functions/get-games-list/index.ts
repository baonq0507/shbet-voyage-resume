import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameResponse {
  id: string;
  name: string;
  image: string;
  type: string;
  category: string;
  isActive: boolean;
  provider: string;
  rank: number;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://hlydtwqhiuwbikkjemck.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseWR0d3FoaXV3Ymlra2plbWNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MDUyNCwiZXhwIjoyMDY5ODI2NTI0fQ.HW8u2xzshPyajWCzDf8PeUlFKjdC8Q8dFKJa1qSK1RY';

console.log('🚀 Initializing Supabase client with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Shuffle array utility function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function fetchGamesFromDatabase(category: string = "all", gpids?: number[], limit?: number): Promise<GameResponse[]> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] 🚀 Starting fetchGamesFromDatabase - Category: ${category}, GPIDs: ${JSON.stringify(gpids)}, Limit: ${limit}`);

    // Build query based on whether GPIDs are provided
    let query = supabase
      .from('games')
      .select('*')
      .eq('is_active', true);

    if (gpids && gpids.length > 0) {
      console.log(`[${requestId}] 🔍 Filtering by GPIDs: ${gpids}`);
      query = query.in('gpid', gpids);
    } else if (category !== 'all') {
      console.log(`[${requestId}] 🔍 Filtering by category: ${category}`);
      query = query.eq('category', category);
    } else {
      console.log(`[${requestId}] 🔍 Fetching all games`);
    }

    // Add limit if specified
    if (limit) {
      query = query.limit(limit);
    }

    const { data: games, error } = await query.order('rank', { ascending: true });

    if (error) {
      console.error(`[${requestId}] ❌ Database query failed:`, error);
      throw new Error(`Database query failed: ${error.message}`);
    }

    console.log(`[${requestId}] 📋 Total games from database: ${games?.length || 0}`);

    if (!games || games.length === 0) {
      console.log(`[${requestId}] ⚠️ No games found for category: ${category}, GPIDs: ${JSON.stringify(gpids)}`);
      return [];
    }

    // Transform database data to our format
    const transformedGames: GameResponse[] = games.map((game: any) => {
      const transformedGame = {
        id: game.id.toString(),
        name: game.name || `Game ${game.id}`,
        image: game.image || "https://via.placeholder.com/300x200?text=No+Image",
        type: game.type || 'Unknown',
        category: game.category || category,
        isActive: game.is_active || false,
        provider: game.provider || 'Unknown',
        rank: game.rank || 0
      };
      
      console.log(`[${requestId}] 🎮 Transformed game: ${transformedGame.name} (ID: ${transformedGame.id}, Type: ${transformedGame.type})`);
      return transformedGame;
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[${requestId}] ✅ Successfully fetched ${transformedGames.length} games in ${duration}ms`);
    
    return transformedGames;

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`[${requestId}] ❌ Error fetching games from database after ${duration}ms:`, error);
    console.error(`[${requestId}] 🔍 Error details:`, {
      message: error.message,
      stack: error.stack,
      category,
      gpids,
      duration
    });
    
    // Return empty array, let caller handle fallback
    console.log(`[${requestId}] 🛟 Returning empty array for error handling`);
    return [];
  }
}

function getFallbackGames(category: string): GameResponse[] {
  console.log(`🛟 Using fallback data for category: ${category}`);
  
  const fallbackData: Record<string, GameResponse[]> = {
    "all": [
      {
        id: "1",
        name: "Live Baccarat VIP",
        image: "https://via.placeholder.com/300x200?text=Live+Baccarat",
        type: "Baccarat",
        category: "casino",
        isActive: true,
        provider: "Evolution",
        rank: 1
      },
      {
        id: "2", 
        name: "Live Roulette Gold",
        image: "https://via.placeholder.com/300x200?text=Live+Roulette",
        type: "Roulette",
        category: "casino",
        isActive: true,
        provider: "Evolution",
        rank: 2
      },
      {
        id: "3",
        name: "Sweet Bonanza Xmas",
        image: "https://via.placeholder.com/300x200?text=Sweet+Bonanza",
        type: "Slot",
        category: "slots",
        isActive: true,
        provider: "Pragmatic Play",
        rank: 3
      }
    ],
    "casino": [
      {
        id: "10",
        name: "Live Baccarat VIP",
        image: "https://via.placeholder.com/300x200?text=Live+Baccarat",
        type: "Baccarat",
        category: "casino",
        isActive: true,
        provider: "Evolution",
        rank: 1
      },
      {
        id: "11",
        name: "Live Roulette Gold", 
        image: "https://via.placeholder.com/300x200?text=Live+Roulette",
        type: "Roulette",
        category: "casino",
        isActive: true,
        provider: "Evolution",
        rank: 2
      }
    ],
    "slots": [
      {
        id: "20",
        name: "Sweet Bonanza Xmas",
        image: "https://via.placeholder.com/300x200?text=Sweet+Bonanza",
        type: "Slot",
        category: "slots",
        isActive: true,
        provider: "Pragmatic Play",
        rank: 1
      },
      {
        id: "21",
        name: "Gates of Olympus 1000",
        image: "https://via.placeholder.com/300x200?text=Gates+Olympus",
        type: "Slot",
        category: "slots",
        isActive: true,
        provider: "Pragmatic Play",
        rank: 2
      }
    ],
    "sports": [
      {
        id: "30",
        name: "Cá Cược Bóng Đá",
        image: "https://via.placeholder.com/300x200?text=Football+Betting",
        type: "Sports Betting",
        category: "sports",
        isActive: true,
        provider: "SABA Sports",
        rank: 1
      },
      {
        id: "31",
        name: "Cá Cược Bóng Rổ",
        image: "https://via.placeholder.com/300x200?text=Basketball+Betting",
        type: "Sports Betting",
        category: "sports",
        isActive: true,
        provider: "AFB Sports",
        rank: 2
      },
      {
        id: "32",
        name: "Cá Cược Tennis",
        image: "https://via.placeholder.com/300x200?text=Tennis+Betting",
        type: "Sports Betting",
        category: "sports",
        isActive: true,
        provider: "BTI Sports",
        rank: 3
      },
      {
        id: "33",
        name: "E-Sports Betting",
        image: "https://via.placeholder.com/300x200?text=Esports+Betting",
        type: "Sports Betting",
        category: "sports",
        isActive: true,
        provider: "PANDA Sports",
        rank: 4
      }
    ],
    "card-games": [
      {
        id: "40",
        name: "Texas Hold'em Poker",
        image: "https://via.placeholder.com/300x200?text=Poker",
        type: "Card Game",
        category: "card-games",
        isActive: true,
        provider: "JOKER",
        rank: 1
      }
    ],
    "fishing": [
      {
        id: "50",
        name: "Fish Hunter King",
        image: "https://via.placeholder.com/300x200?text=Fish+Hunter",
        type: "Fishing Game",
        category: "fishing",
        isActive: true,
        provider: "JIL",
        rank: 1
      }
    ]
  };

  const result = fallbackData[category] || fallbackData["all"];
  console.log(`🛟 Returning ${result.length} fallback games for category: ${category}`);
  return result;
}

serve(async (req) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`[${requestId}] 🌐 New request received - Method: ${req.method}, URL: ${req.url}`);
  console.log(`[${requestId}] 🌐 Headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] 🔄 CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let category = 'all';
    let gpids: number[] | undefined;

    // Handle both GET (URL params) and POST (body) requests
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        category = body.category || 'all';
        gpids = body.gpids;
        console.log(`[${requestId}] 📥 POST request body:`, JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error(`[${requestId}] ❌ Error parsing request body:`, parseError);
        category = 'all';
      }
    } else {
      const url = new URL(req.url);
      category = url.searchParams.get('category') || 'all';
      const gpidsParam = url.searchParams.get('gpids');
      if (gpidsParam) {
        gpids = gpidsParam.split(',').map(Number).filter(n => !isNaN(n));
      }
      console.log(`[${requestId}] 📥 GET request params:`, Object.fromEntries(url.searchParams.entries()));
    }

    console.log(`[${requestId}] 🎯 Processing request for category: ${category}, GPIDs: ${JSON.stringify(gpids)}`);

    let games: GameResponse[] = [];

    // Special handling for "all" category - fetch 5 games from each category and shuffle
    if (category === "all") {
      const categories = ['live-casino', 'slots', 'sports', 'card-games', 'fishing'];
      const allCategoryGames: GameResponse[] = [];

      console.log(`[${requestId}] 🔀 Processing "all" category - fetching from multiple categories`);
      
      for (const cat of categories) {
        try {
          const categoryGames = await fetchGamesFromDatabase(cat, gpids, 5); // Limit to 5 games per category
          console.log(`[${requestId}] 📊 Fetched ${categoryGames.length} games from category: ${cat}`);
          allCategoryGames.push(...categoryGames);
        } catch (error) {
          console.error(`[${requestId}] ❌ Error fetching games for category ${cat}:`, error);
          // Continue with other categories even if one fails
        }
      }

      // Shuffle the combined games array
      games = shuffleArray(allCategoryGames);
      console.log(`[${requestId}] 🎲 Total games after shuffling: ${games.length}`);
      
      // If no games found from any category, use fallback
      if (games.length === 0) {
        console.log(`[${requestId}] 🛟 No games found from any category, using fallback data`);
        games = getFallbackGames(category);
      }
    } else {
      // Regular category-specific fetch
      games = await fetchGamesFromDatabase(category, gpids);
      
      // If no games found, use fallback
      if (games.length === 0) {
        console.log(`[${requestId}] 🛟 No games found for category ${category}, using fallback data`);
        games = getFallbackGames(category);
      }
    }
    
    console.log(`[${requestId}] 📊 Final games result count: ${games.length}`);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`[${requestId}] ✅ Request completed successfully in ${duration}ms - Returning ${games.length} games`);

    const response = {
      success: true,
      data: games,
      pagination: {
        page: 1,
        pageSize: games.length,
        total: games.length
      },
      apiUsed: false,
      databaseUsed: true,
      requestId,
      duration: `${duration}ms`,
      category: category,
      gpids: gpids
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`[${requestId}] ❌ Error in get-games-list function after ${duration}ms:`, error);
    console.error(`[${requestId}] 🔍 Error details:`, {
      message: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      duration: `${duration}ms`
    });
    
    // Return fallback data as ultimate fallback
    console.log(`[${requestId}] 🛟 Using ultimate fallback data`);
    const fallbackGames = getFallbackGames('all');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch games from database',
        data: fallbackGames,
        fallback: true,
        apiUsed: false,
        databaseUsed: false,
        requestId,
        duration: `${duration}ms`,
        category: 'all'
      }),
      {
        status: 200, // Still return 200 but with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});