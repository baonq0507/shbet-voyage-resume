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
  gpid?: number;
}

// Initialize Supabase client
const supabaseUrl = 'http://206.206.126.141:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

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
        rank: game.rank || 0,
        gpid: game.gpid || null
      };
      
      console.log(`[${requestId}] 🎮 Transformed game: ${transformedGame.name} (ID: ${transformedGame.id}, Type: ${transformedGame.type}, GPID: ${transformedGame.gpid})`);
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
    console.log(`[${requestId}] 🛟 Database unavailable, returning empty array for fallback handling`);
    return [];
  }
}

function getFallbackGames(category: string): GameResponse[] {
  console.log(`🛟 Using fallback data for category: ${category}`);
  
  const fallbackData: Record<string, GameResponse[]> = {
    "all": [
      // Casino games matching menu GPIDs
      { id: "5", name: "BG Live Casino", image: "https://via.placeholder.com/300x200?text=BG+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "BG", rank: 1, gpid: 5 },
      { id: "7", name: "SE Live Casino", image: "https://via.placeholder.com/300x200?text=SE+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "SE", rank: 2, gpid: 7 },
      { id: "19", name: "SA Live Casino", image: "https://via.placeholder.com/300x200?text=SA+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "SA", rank: 3, gpid: 19 },
      // Slots games matching menu GPIDs
      { id: "2", name: "CQ9 Slots", image: "https://via.placeholder.com/300x200?text=CQ9+Slots", type: "Slot", category: "slots", isActive: true, provider: "CQ9", rank: 1, gpid: 2 },
      { id: "3", name: "PP Slots", image: "https://via.placeholder.com/300x200?text=PP+Slots", type: "Slot", category: "slots", isActive: true, provider: "Pragmatic Play", rank: 2, gpid: 3 },
      { id: "13", name: "WM Slots", image: "https://via.placeholder.com/300x200?text=WM+Slots", type: "Slot", category: "slots", isActive: true, provider: "WM", rank: 3, gpid: 13 },
      // Sports games matching menu GPIDs
      { id: "44", name: "SABA Thể Thao", image: "https://via.placeholder.com/300x200?text=SABA+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "SABA", rank: 1, gpid: 44 },
      { id: "1015", name: "AFB Thể Thao", image: "https://via.placeholder.com/300x200?text=AFB+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "AFB", rank: 2, gpid: 1015 },
      { id: "1022", name: "BTI Thể Thao", image: "https://via.placeholder.com/300x200?text=BTI+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "BTI", rank: 3, gpid: 1022 }
    ],
    "casino": [
      // Casino games with exact GPIDs from menu items
      { id: "5", name: "BG Live Casino", image: "https://via.placeholder.com/300x200?text=BG+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "BG", rank: 1, gpid: 5 },
      { id: "7", name: "SE Live Casino", image: "https://via.placeholder.com/300x200?text=SE+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "SE", rank: 2, gpid: 7 },
      { id: "19", name: "SA Live Casino", image: "https://via.placeholder.com/300x200?text=SA+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "SA", rank: 3, gpid: 19 },
      { id: "20", name: "EVO Live Casino", image: "https://via.placeholder.com/300x200?text=EVO+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "Evolution", rank: 4, gpid: 20 },
      { id: "28", name: "AB Live Casino", image: "https://via.placeholder.com/300x200?text=AB+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "AB", rank: 5, gpid: 28 },
      { id: "33", name: "GD Live Casino", image: "https://via.placeholder.com/300x200?text=GD+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "GD", rank: 6, gpid: 33 },
      { id: "38", name: "PP Live Casino", image: "https://via.placeholder.com/300x200?text=PP+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "Pragmatic Play", rank: 7, gpid: 38 },
      { id: "1019", name: "YB Live Casino", image: "https://via.placeholder.com/300x200?text=YB+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "YB", rank: 8, gpid: 1019 },
      { id: "1021", name: "OG Live Casino", image: "https://via.placeholder.com/300x200?text=OG+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "OG", rank: 9, gpid: 1021 },
      { id: "1024", name: "AFB Live Casino", image: "https://via.placeholder.com/300x200?text=AFB+Casino", type: "Live Casino", category: "casino", isActive: true, provider: "AFB", rank: 10, gpid: 1024 }
    ],
    "slots": [
      // NoHu/Slots games with exact GPIDs from menu items  
      { id: "2", name: "CQ9 Slots", image: "https://via.placeholder.com/300x200?text=CQ9+Slots", type: "Slot", category: "slots", isActive: true, provider: "CQ9", rank: 1, gpid: 2 },
      { id: "3", name: "PP Slots", image: "https://via.placeholder.com/300x200?text=PP+Slots", type: "Slot", category: "slots", isActive: true, provider: "Pragmatic Play", rank: 2, gpid: 3 },
      { id: "13", name: "WM Slots", image: "https://via.placeholder.com/300x200?text=WM+Slots", type: "Slot", category: "slots", isActive: true, provider: "WM", rank: 3, gpid: 13 },
      { id: "14", name: "SBO Slots", image: "https://via.placeholder.com/300x200?text=SBO+Slots", type: "Slot", category: "slots", isActive: true, provider: "SBO", rank: 4, gpid: 14 },
      { id: "16", name: "FK Slots", image: "https://via.placeholder.com/300x200?text=FK+Slots", type: "Slot", category: "slots", isActive: true, provider: "FK", rank: 5, gpid: 16 },
      { id: "22", name: "YG Slots", image: "https://via.placeholder.com/300x200?text=YG+Slots", type: "Slot", category: "slots", isActive: true, provider: "YG", rank: 6, gpid: 22 },
      { id: "29", name: "MG Slots", image: "https://via.placeholder.com/300x200?text=MG+Slots", type: "Slot", category: "slots", isActive: true, provider: "MG", rank: 7, gpid: 29 },
      { id: "35", name: "PG Slots", image: "https://via.placeholder.com/300x200?text=PG+Slots", type: "Slot", category: "slots", isActive: true, provider: "PG", rank: 8, gpid: 35 },
      { id: "1010", name: "YGR Slots", image: "https://via.placeholder.com/300x200?text=YGR+Slots", type: "Slot", category: "slots", isActive: true, provider: "YGR", rank: 9, gpid: 1010 },
      { id: "1018", name: "PT Slots", image: "https://via.placeholder.com/300x200?text=PT+Slots", type: "Slot", category: "slots", isActive: true, provider: "PT", rank: 10, gpid: 1018 },
      { id: "1020", name: "JIL Slots", image: "https://via.placeholder.com/300x200?text=JIL+Slots", type: "Slot", category: "slots", isActive: true, provider: "JIL", rank: 11, gpid: 1020 }
    ],
    "sports": [
      // Sports games with exact GPIDs from menu items
      { id: "44", name: "SABA Thể Thao", image: "https://via.placeholder.com/300x200?text=SABA+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "SABA", rank: 1, gpid: 44 },
      { id: "1015", name: "AFB Thể Thao", image: "https://via.placeholder.com/300x200?text=AFB+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "AFB", rank: 2, gpid: 1015 },
      { id: "1022", name: "BTI Thể Thao", image: "https://via.placeholder.com/300x200?text=BTI+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "BTI", rank: 3, gpid: 1022 },
      { id: "1053", name: "PANDA Thể Thao", image: "https://via.placeholder.com/300x200?text=PANDA+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "PANDA", rank: 4, gpid: 1053 },
      { id: "1070", name: "WS168 Thể Thao", image: "https://via.placeholder.com/300x200?text=WS168+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "WS168", rank: 5, gpid: 1070 },
      { id: "1080", name: "LUCKY Thể Thao", image: "https://via.placeholder.com/300x200?text=LUCKY+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "LUCKY", rank: 6, gpid: 1080 },
      { id: "1086", name: "APG Thể Thao", image: "https://via.placeholder.com/300x200?text=APG+Sports", type: "Sports Betting", category: "sports", isActive: true, provider: "APG", rank: 7, gpid: 1086 }
    ],
    "fishing": [
      // Fishing/BanCa games with exact GPIDs from menu items
      { id: "1020", name: "JIL Bắn Cá", image: "https://via.placeholder.com/300x200?text=JIL+Fishing", type: "Fishing Game", category: "fishing", isActive: true, provider: "JIL", rank: 1, gpid: 1020 },
      { id: "1012", name: "TCG Bắn Cá", image: "https://via.placeholder.com/300x200?text=TCG+Fishing", type: "Fishing Game", category: "fishing", isActive: true, provider: "TCG", rank: 2, gpid: 1012 }
    ],
    "card-games": [
      // Card games with exact GPIDs from menu items
      { id: "10", name: "JOKER Game Bài", image: "https://via.placeholder.com/300x200?text=JOKER+Cards", type: "Card Game", category: "card-games", isActive: true, provider: "JOKER", rank: 1, gpid: 10 },
      { id: "1011", name: "Mipoker Game Bài", image: "https://via.placeholder.com/300x200?text=Mipoker+Cards", type: "Card Game", category: "card-games", isActive: true, provider: "Mipoker", rank: 2, gpid: 1011 },
      { id: "1013", name: "JGR Game Bài", image: "https://via.placeholder.com/300x200?text=JGR+Cards", type: "Card Game", category: "card-games", isActive: true, provider: "JGR", rank: 3, gpid: 1013 }
    ],
    "cockfight": [
      // Cockfight/DaGa games with exact GPIDs from menu items
      { id: "1001", name: "WS168 Đá Gà", image: "https://via.placeholder.com/300x200?text=WS168+Cockfight", type: "Cockfight", category: "cockfight", isActive: true, provider: "WS168", rank: 1, gpid: 1001 },
      { id: "1002", name: "AOG Đá Gà", image: "https://via.placeholder.com/300x200?text=AOG+Cockfight", type: "Cockfight", category: "cockfight", isActive: true, provider: "AOG", rank: 2, gpid: 1002 }
    ],
    "lottery": [
      // Lottery/XoSo games with exact GPIDs from menu items
      { id: "1003", name: "TC Xổ Số", image: "https://via.placeholder.com/300x200?text=TC+Lottery", type: "Lottery", category: "lottery", isActive: true, provider: "TC", rank: 1, gpid: 1003 }
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

    // Try to fetch from database first
    console.log(`[${requestId}] 🎯 Trying to fetch from database first for category: ${category}, GPIDs: ${JSON.stringify(gpids)}`);
    
    try {
      // Attempt to fetch from database
      const dbGames = await fetchGamesFromDatabase(category, gpids, 50);
      
      if (dbGames && dbGames.length > 0) {
        games = dbGames;
        console.log(`[${requestId}] ✅ Successfully fetched ${games.length} games from database`);
      } else {
        console.log(`[${requestId}] ⚠️ No games found in database, using fallback data`);
        
        // Special handling for "all" category - fetch 5 games from each category and shuffle
        if (category === "all") {
          const categories = ['live-casino', 'slots', 'sports', 'card-games', 'fishing'];
          const allCategoryGames: GameResponse[] = [];

          console.log(`[${requestId}] 🔀 Processing "all" category - getting fallback from multiple categories`);
          
          for (const cat of categories) {
            try {
              const categoryFallback = getFallbackGames(cat).slice(0, 5); // Get 5 games per category
              console.log(`[${requestId}] 📊 Got ${categoryFallback.length} fallback games from category: ${cat}`);
              allCategoryGames.push(...categoryFallback);
            } catch (error) {
              console.error(`[${requestId}] ❌ Error getting fallback for category ${cat}:`, error);
            }
          }

          // Shuffle the combined games array
          games = shuffleArray(allCategoryGames);
          console.log(`[${requestId}] 🎲 Total games after shuffling: ${games.length}`);
        } else {
          // For specific categories, get fallback data directly
          games = getFallbackGames(category);
          console.log(`[${requestId}] 🛟 Using fallback data for category ${category}: ${games.length} games`);
          
          // Filter by GPIDs if provided
          if (gpids && gpids.length > 0) {
            const originalCount = games.length;
            games = games.filter(game => gpids.includes(Number(game.id)));
            console.log(`[${requestId}] 📋 Filtered by GPIDs: ${originalCount} -> ${games.length} games`);
          }
        }
      }
    } catch (error) {
      console.error(`[${requestId}] ❌ Database fetch failed, using fallback:`, error);
      
      // Use fallback data when database is unavailable
      if (category === "all") {
        const categories = ['live-casino', 'slots', 'sports', 'card-games', 'fishing'];
        const allCategoryGames: GameResponse[] = [];
        
        for (const cat of categories) {
          const categoryFallback = getFallbackGames(cat).slice(0, 5);
          allCategoryGames.push(...categoryFallback);
        }
        
        games = shuffleArray(allCategoryGames);
      } else {
        games = getFallbackGames(category);
        
        if (gpids && gpids.length > 0) {
          games = games.filter(game => gpids.includes(Number(game.id)));
        }
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