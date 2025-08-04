import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameInfo {
  language: string;
  gameName: string;
  gameIconUrl: string;
}

interface GameAPIResponse {
  seamlessGameProviderGames: GameData[];
  serverId: string;
  error: {
    id: number;
    msg: string;
  };
}

interface GameData {
  gameProviderId: number;
  gameID: number;
  gameType: number;
  newGameType: number;
  rank: number;
  device: any;
  platform: any;
  provider: string;
  rtp: number;
  rows: number;
  reels: number;
  lines: number;
  gameInfos: GameInfo[];
  supportedCurrencies: string[];
  blockCountries: string[];
  isMaintain: boolean;
  isEnabled: boolean;
  isProvideCommission: boolean;
  hasHedgeBet: boolean;
  providerStatus: string;
  isProviderOnline: boolean;
}

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

// API Configuration
const API_CONFIG = {
  baseUrl: "https://ex-api-yy5.tw946.com/web-root/restricted/information/get-game-list.aspx",
  companyKey: "C6012BA39EB643FEA4F5CD49AF138B02",
  serverId: "206.206.126.141",
  gpid: 5
};

// Map game types to readable names
const GAME_TYPE_MAP: Record<number, string> = {
  101: "Baccarat",
  103: "Roulette", 
  104: "Dragon Tiger",
  105: "Sic Bo",
  106: "Bull Bull",
  108: "Se Die",
  204: "Card Games",
  203: "Fish Game",
  100: "Live Casino"
};

async function fetchGamesFromAPI(category: string = "all", gpid?: number): Promise<GameResponse[]> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Use provided gpid or fallback to default
  const finalGpid = gpid || API_CONFIG.gpid;
  
  try {
    console.log(`[${requestId}] 🚀 Starting fetchGamesFromAPI - Category: ${category}, GPID: ${finalGpid}`);
    console.log(`[${requestId}] 📡 API URL: ${API_CONFIG.baseUrl}`);

    const requestBody = {
      CompanyKey: API_CONFIG.companyKey,
      ServerId: API_CONFIG.serverId,
      Gpid: finalGpid
    };
    
    console.log(`[${requestId}] 📤 Request payload:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`[${requestId}] 📥 Response status: ${response.status} ${response.statusText}`);
    console.log(`[${requestId}] 📥 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] ❌ API request failed - Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`API request failed with status: ${response.status} - ${errorText}`);
    }

    const data: GameAPIResponse = await response.json();
    console.log(`[${requestId}] 📊 Raw API response:`, JSON.stringify(data, null, 2));
    
    if (data.error.id !== 0) {
      console.error(`[${requestId}] ❌ API returned error - ID: ${data.error.id}, Message: ${data.error.msg}`);
      throw new Error(data.error.msg || 'API returned error');
    }

    if (!data.seamlessGameProviderGames || !Array.isArray(data.seamlessGameProviderGames)) {
      console.error(`[${requestId}] ❌ Invalid data format - seamlessGameProviderGames is not an array`);
      throw new Error('Invalid data format from API');
    }

    console.log(`[${requestId}] 📋 Total games from API: ${data.seamlessGameProviderGames.length}`);

    // Transform API data to our format
    const games: GameResponse[] = data.seamlessGameProviderGames
      .filter(game => {
        const isEnabled = game.isEnabled && !game.isMaintain;
        if (!isEnabled) {
          console.log(`[${requestId}] ⏭️ Skipping disabled/maintenance game: ${game.gameID} (enabled: ${game.isEnabled}, maintain: ${game.isMaintain})`);
        }
        return isEnabled;
      })
      .map((game: GameData) => {
        // Get English game info, fallback to first available
        const gameInfo = game.gameInfos.find(info => info.language !== null) || game.gameInfos[0];
        const gameType = GAME_TYPE_MAP[game.newGameType] || `Type ${game.newGameType}`;
        
        const transformedGame = {
          id: `${game.gameProviderId}_${game.gameID}`,
          name: gameInfo?.gameName || `Game ${game.gameID}`,
          image: gameInfo?.gameIconUrl || "https://via.placeholder.com/300x200?text=No+Image",
          type: gameType,
          category: gameType,
          isActive: game.isEnabled && game.isProviderOnline,
          provider: game.provider,
          rank: game.rank
        };
        
        console.log(`[${requestId}] 🎮 Transformed game: ${transformedGame.name} (ID: ${transformedGame.id}, Type: ${transformedGame.type})`);
        return transformedGame;
      })
      .sort((a, b) => a.rank - b.rank); // Sort by rank

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[${requestId}] ✅ Successfully fetched ${games.length} games in ${duration}ms`);
    console.log(`[${requestId}] 📈 Performance: ${duration}ms total, ${games.length} games processed`);
    
    return games;

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`[${requestId}] ❌ Error fetching games from API for category ${category} with GPID ${finalGpid} after ${duration}ms:`, error);
    console.error(`[${requestId}] 🔍 Error details:`, {
      message: error.message,
      stack: error.stack,
      category,
      gpid: finalGpid,
      duration
    });
    
    // Return fallback data if API fails
    console.log(`[${requestId}] 🛟 Returning fallback data for category: ${category}`);
    return getFallbackGames(category);
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
        category: "Baccarat",
        isActive: true,
        provider: "BigGaming",
        rank: 1
      },
      {
        id: "2", 
        name: "Live Roulette Gold",
        image: "https://via.placeholder.com/300x200?text=Live+Roulette",
        type: "Roulette",
        category: "Roulette",
        isActive: true,
        provider: "BigGaming",
        rank: 2
      },
      {
        id: "3",
        name: "Sweet Bonanza Xmas",
        image: "https://via.placeholder.com/300x200?text=Sweet+Bonanza",
        type: "Slot",
        category: "Slot Machine",
        isActive: true,
        provider: "BigGaming",
        rank: 3
      }
    ],
    "live-casino": [
      {
        id: "10",
        name: "Live Baccarat VIP",
        image: "https://via.placeholder.com/300x200?text=Live+Baccarat",
        type: "Baccarat",
        category: "Baccarat",
        isActive: true,
        provider: "BigGaming",
        rank: 1
      },
      {
        id: "11",
        name: "Live Roulette Gold", 
        image: "https://via.placeholder.com/300x200?text=Live+Roulette",
        type: "Roulette",
        category: "Roulette",
        isActive: true,
        provider: "BigGaming",
        rank: 2
      },
      {
        id: "12",
        name: "Live Blackjack Premium",
        image: "https://via.placeholder.com/300x200?text=Live+Blackjack",
        type: "Blackjack",
        category: "Blackjack",
        isActive: true,
        provider: "BigGaming",
        rank: 3
      }
    ],
    "slots": [
      {
        id: "20",
        name: "Sweet Bonanza Xmas",
        image: "https://via.placeholder.com/300x200?text=Sweet+Bonanza",
        type: "Slot",
        category: "Slot Machine",
        isActive: true,
        provider: "BigGaming",
        rank: 1
      },
      {
        id: "21",
        name: "Gates of Olympus 1000",
        image: "https://via.placeholder.com/300x200?text=Gates+Olympus",
        type: "Slot",
        category: "Slot Machine",
        isActive: true,
        provider: "BigGaming",
        rank: 2
      },
      {
        id: "22",
        name: "Sugar Rush Ultimate",
        image: "https://via.placeholder.com/300x200?text=Sugar+Rush",
        type: "Slot",
        category: "Slot Machine",
        isActive: true,
        provider: "BigGaming",
        rank: 3
      }
    ],
    "sports": [
      {
        id: "30",
        name: "Football Manager 2024",
        image: "https://via.placeholder.com/300x200?text=Football+Manager",
        type: "Sports",
        category: "Sports",
        isActive: true,
        provider: "BigGaming",
        rank: 1
      },
      {
        id: "31",
        name: "NBA 2K24",
        image: "https://via.placeholder.com/300x200?text=NBA+2K24",
        type: "Sports",
        category: "Sports",
        isActive: true,
        provider: "BigGaming",
        rank: 2
      },
      {
        id: "32",
        name: "FIFA 24",
        image: "https://via.placeholder.com/300x200?text=FIFA+24",
        type: "Sports",
        category: "Sports",
        isActive: true,
        provider: "BigGaming",
        rank: 3
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
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] 🔄 CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let category = 'all';
    let gpid: number | undefined;

    // Handle both GET (URL params) and POST (body) requests
    if (req.method === 'POST') {
      const body = await req.json();
      category = body.category || 'all';
      gpid = body.gpid ? parseInt(body.gpid) : undefined;
      console.log(`[${requestId}] 📥 POST request body:`, JSON.stringify(body, null, 2));
    } else {
      const url = new URL(req.url);
      category = url.searchParams.get('category') || 'all';
      const gpidParam = url.searchParams.get('gpid');
      gpid = gpidParam ? parseInt(gpidParam) : undefined;
      console.log(`[${requestId}] 📥 GET request params:`, Object.fromEntries(url.searchParams.entries()));
    }

    console.log(`[${requestId}] 🎯 Processing request for category: ${category}, GPID: ${gpid || 'default'}`);

    const games = await fetchGamesFromAPI(category, gpid);
    console.log(`[${requestId}] 📊 Final games result:`, JSON.stringify(games, null, 2));
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`[${requestId}] ✅ Request completed successfully in ${duration}ms - Returning ${games.length} games`);

    return new Response(
      JSON.stringify({
        success: true,
        data: games,
        pagination: {
          page: 1,
          pageSize: games.length,
          total: games.length
        },
        apiUsed: true,
        requestId,
        duration: `${duration}ms`,
        gpid: gpid || API_CONFIG.gpid
      }),
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
        error: 'Failed to fetch games from API',
        data: fallbackGames,
        fallback: true,
        apiUsed: false,
        requestId,
        duration: `${duration}ms`,
        gpid: API_CONFIG.gpid // Use default gpid in error case
      }),
      {
        status: 200, // Still return 200 but with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});