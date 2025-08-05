import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

interface DatabaseGame {
  game_id: string;
  name: string;
  image: string;
  type: string;
  category: string;
  is_active: boolean;
  provider: string;
  rank: number;
  gpid: number;
  game_provider_id: number;
  game_type: number;
  new_game_type: number;
  rtp: number;
  rows: number;
  reels: number;
  lines: number;
  is_maintain: boolean;
  is_enabled: boolean;
  is_provider_online: boolean;
  supported_currencies: string[];
  block_countries: string[];
}

// API Configuration
const API_CONFIG = {
  baseUrl: "https://ex-api-yy5.tw946.com/web-root/restricted/information/get-game-list.aspx",
  companyKey: "C6012BA39EB643FEA4F5CD49AF138B02",
  serverId: "206.206.126.141"
};

// Casino GPID list
const CASINO_GPIDS = [1, 5, 6, 10, 11, 20, 28, 33, 38, 1019, 1021, 1022, 1024];

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

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchGamesFromAPI(gpid: number): Promise<DatabaseGame[]> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] 🚀 Starting fetchGamesFromAPI - GPID: ${gpid}`);
    console.log(`[${requestId}] 📡 API URL: ${API_CONFIG.baseUrl}`);

    const requestBody = {
      CompanyKey: API_CONFIG.companyKey,
      ServerId: API_CONFIG.serverId,
      Gpid: gpid
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] ❌ API request failed - Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`API request failed with status: ${response.status} - ${errorText}`);
    }

    const data: GameAPIResponse = await response.json();
    console.log(`[${requestId}] 📊 Raw API response received for GPID ${gpid}`);
    
    if (data.error.id !== 0) {
      console.error(`[${requestId}] ❌ API returned error - ID: ${data.error.id}, Message: ${data.error.msg}`);
      throw new Error(data.error.msg || 'API returned error');
    }

    if (!data.seamlessGameProviderGames || !Array.isArray(data.seamlessGameProviderGames)) {
      console.error(`[${requestId}] ❌ Invalid data format - seamlessGameProviderGames is not an array`);
      throw new Error('Invalid data format from API');
    }

    console.log(`[${requestId}] 📋 Total games from API for GPID ${gpid}: ${data.seamlessGameProviderGames.length}`);

    // Transform API data to database format
    const games: DatabaseGame[] = data.seamlessGameProviderGames
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
        
        const transformedGame: DatabaseGame = {
          game_id: `${game.gameProviderId}_${game.gameID}`,
          name: gameInfo?.gameName || `Game ${game.gameID}`,
          image: gameInfo?.gameIconUrl || "https://via.placeholder.com/300x200?text=No+Image",
          type: gameType,
          category: gameType,
          is_active: game.isEnabled && game.isProviderOnline,
          provider: game.provider,
          rank: game.rank,
          gpid: gpid,
          game_provider_id: game.gameProviderId,
          game_type: game.gameType,
          new_game_type: game.newGameType,
          rtp: game.rtp,
          rows: game.rows,
          reels: game.reels,
          lines: game.lines,
          is_maintain: game.isMaintain,
          is_enabled: game.isEnabled,
          is_provider_online: game.isProviderOnline,
          supported_currencies: game.supportedCurrencies || [],
          block_countries: game.blockCountries || []
        };
        
        console.log(`[${requestId}] 🎮 Transformed game: ${transformedGame.name} (ID: ${transformedGame.game_id}, Type: ${transformedGame.type})`);
        return transformedGame;
      })
      .sort((a, b) => a.rank - b.rank); // Sort by rank

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[${requestId}] ✅ Successfully fetched ${games.length} games for GPID ${gpid} in ${duration}ms`);
    
    return games;

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`[${requestId}] ❌ Error fetching games from API for GPID ${gpid} after ${duration}ms:`, error);
    console.error(`[${requestId}] 🔍 Error details:`, {
      message: error.message,
      stack: error.stack,
      gpid,
      duration
    });
    
    return []; // Return empty array on error
  }
}

async function saveGamesToDatabase(games: DatabaseGame[]): Promise<{ success: number; error: number }> {
  if (games.length === 0) {
    return { success: 0, error: 0 };
  }

  try {
    console.log(`💾 Saving ${games.length} games to database...`);

    // Use upsert to handle duplicates
    const { data, error } = await supabase
      .from('games')
      .upsert(games, {
        onConflict: 'game_id,gpid',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ Error saving games to database:', error);
      return { success: 0, error: games.length };
    }

    console.log(`✅ Successfully saved ${games.length} games to database`);
    return { success: games.length, error: 0 };

  } catch (error) {
    console.error('❌ Exception while saving games to database:', error);
    return { success: 0, error: games.length };
  }
}

async function syncGamesForGPIDs(gpids: number[]): Promise<{
  totalGames: number;
  successCount: number;
  errorCount: number;
  results: Array<{ gpid: number; gamesCount: number; success: boolean; error?: string }>;
}> {
  const results: Array<{ gpid: number; gamesCount: number; success: boolean; error?: string }> = [];
  let totalGames = 0;
  let totalSuccess = 0;
  let totalError = 0;

  console.log(`🔄 Starting sync for ${gpids.length} GPIDs: ${gpids.join(', ')}`);

  for (const gpid of gpids) {
    try {
      console.log(`\n📡 Processing GPID: ${gpid}`);
      
      // Fetch games from API
      const games = await fetchGamesFromAPI(gpid);
      
      if (games.length === 0) {
        console.log(`⚠️ No games found for GPID ${gpid}`);
        results.push({ gpid, gamesCount: 0, success: true });
        continue;
      }

      // Save to database
      const saveResult = await saveGamesToDatabase(games);
      
      totalGames += games.length;
      totalSuccess += saveResult.success;
      totalError += saveResult.error;

      results.push({
        gpid,
        gamesCount: games.length,
        success: saveResult.error === 0,
        error: saveResult.error > 0 ? `Failed to save ${saveResult.error} games` : undefined
      });

      console.log(`✅ GPID ${gpid}: ${games.length} games processed (${saveResult.success} saved, ${saveResult.error} errors)`);

      // Add delay between requests to avoid overwhelming the API
      if (gpid !== gpids[gpids.length - 1]) {
        console.log(`⏳ Waiting 1 second before next request...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`❌ Error processing GPID ${gpid}:`, error);
      results.push({
        gpid,
        gamesCount: 0,
        success: false,
        error: error.message
      });
      totalError++;
    }
  }

  return {
    totalGames,
    successCount: totalSuccess,
    errorCount: totalError,
    results
  };
}

serve(async (req) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`[${requestId}] 🌐 New sync-games-database request received - Method: ${req.method}, URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] 🔄 CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let gpids = CASINO_GPIDS; // Default to casino GPIDs
    let category = 'casino';

    // Handle both GET (URL params) and POST (body) requests
    if (req.method === 'POST') {
      const body = await req.json();
      gpids = body.gpids || CASINO_GPIDS;
      category = body.category || 'casino';
      console.log(`[${requestId}] 📥 POST request body:`, JSON.stringify(body, null, 2));
    } else {
      const url = new URL(req.url);
      const gpidsParam = url.searchParams.get('gpids');
      gpids = gpidsParam ? JSON.parse(gpidsParam) : CASINO_GPIDS;
      category = url.searchParams.get('category') || 'casino';
      console.log(`[${requestId}] 📥 GET request params:`, Object.fromEntries(url.searchParams.entries()));
    }

    console.log(`[${requestId}] 🎯 Processing sync request for category: ${category}, GPIDs: ${gpids.join(', ')}`);

    // Sync games for all GPIDs
    const syncResult = await syncGamesForGPIDs(gpids);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`[${requestId}] ✅ Sync completed successfully in ${duration}ms`);
    console.log(`[${requestId}] 📊 Final sync result:`, JSON.stringify(syncResult, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          category,
          gpids,
          totalGames: syncResult.totalGames,
          successCount: syncResult.successCount,
          errorCount: syncResult.errorCount,
          results: syncResult.results
        },
        requestId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`[${requestId}] ❌ Error in sync-games-database function after ${duration}ms:`, error);
    console.error(`[${requestId}] 🔍 Error details:`, {
      message: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      duration: `${duration}ms`
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to sync games database',
        message: error.message,
        requestId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 