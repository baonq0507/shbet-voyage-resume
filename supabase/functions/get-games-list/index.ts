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

// Khởi tạo Supabase client với biến môi trường
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test kết nối Supabase
async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('games').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
}

async function fetchGamesFromDatabase(category: string = "all", gpids?: number[], limit?: number): Promise<GameResponse[]> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    console.log(`[${requestId}] 🚀 Starting fetchGamesFromDatabase - Category: ${category}, GPIDs: ${JSON.stringify(gpids)}, Limit: ${limit}`);

    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      console.log(`[${requestId}] ⚠️ Supabase connection failed`);
      throw new Error('Supabase connection failed');
    }

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

    // Không trả về fallback, chỉ trả về mảng rỗng
    return [];
  }
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

  // Check if Supabase is properly configured
  if (!supabaseServiceKey) {
    console.error(`[${requestId}] ❌ Supabase not properly configured.`);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Supabase not configured.',
        data: [],
        fallback: false,
        apiUsed: false,
        databaseUsed: false,
        requestId,
        duration: '0ms',
        category: 'all',
        configError: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
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

      // Check for test endpoint
      if (url.pathname === '/test') {
        console.log(`[${requestId}] 🧪 Test endpoint requested`);
        const connectionStatus = await testSupabaseConnection();

        return new Response(
          JSON.stringify({
            success: true,
            test: true,
            supabaseConfigured: !!supabaseServiceKey,
            connectionStatus,
            url: supabaseUrl,
            requestId,
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      category = url.searchParams.get('category') || 'all';
      const gpidsParam = url.searchParams.get('gpids');
      if (gpidsParam) {
        gpids = gpidsParam.split(',').map(Number).filter(n => !isNaN(n));
      }
      console.log(`[${requestId}] 📥 GET request params:`, Object.fromEntries(url.searchParams.entries()));
    }

    console.log(`[${requestId}] 🎯 Processing request for category: ${category}, GPIDs: ${JSON.stringify(gpids)}`);

    let games: GameResponse[] = [];

    // Chỉ lấy từ database, không dùng fallback
    console.log(`[${requestId}] 🎯 Trying to fetch from database for category: ${category}, GPIDs: ${JSON.stringify(gpids)}`);

    const dbGames = await fetchGamesFromDatabase(category, gpids, 50);

    if (dbGames && dbGames.length > 0) {
      games = dbGames;
      console.log(`[${requestId}] ✅ Successfully fetched ${games.length} games from database`);
    } else {
      console.log(`[${requestId}] ⚠️ No games found in database`);
      games = [];
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

    // Không trả về fallback, chỉ trả về mảng rỗng
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch games from database',
        data: [],
        fallback: false,
        apiUsed: false,
        databaseUsed: false,
        requestId,
        duration: `${duration}ms`,
        category: 'all'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});