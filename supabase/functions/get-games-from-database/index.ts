import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GameFilter {
  category?: string;
  type?: string;
  provider?: string;
  gpid?: number;
  is_active?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

serve(async (req) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`[${requestId}] 🌐 New get-games-from-database request received - Method: ${req.method}, URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] 🔄 CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let filter: GameFilter = {};
    let limit = 50;
    let offset = 0;

    // Handle both GET (URL params) and POST (body) requests
    if (req.method === 'POST') {
      const body = await req.json();
      filter = body.filter || {};
      limit = body.limit || 50;
      offset = body.offset || 0;
      console.log(`[${requestId}] 📥 POST request body:`, JSON.stringify(body, null, 2));
    } else {
      const url = new URL(req.url);
      filter = {
        category: url.searchParams.get('category') || undefined,
        type: url.searchParams.get('type') || undefined,
        provider: url.searchParams.get('provider') || undefined,
        gpid: url.searchParams.get('gpid') ? parseInt(url.searchParams.get('gpid')!) : undefined,
        is_active: url.searchParams.get('is_active') ? url.searchParams.get('is_active') === 'true' : undefined,
        search: url.searchParams.get('search') || undefined
      };
      limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 50;
      offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0;
      console.log(`[${requestId}] 📥 GET request params:`, Object.fromEntries(url.searchParams.entries()));
    }

    console.log(`[${requestId}] 🎯 Processing request with filter:`, JSON.stringify(filter, null, 2));

    // Build query
    let query = supabase
      .from('games')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filter.category) {
      query = query.eq('category', filter.category);
    }
    
    if (filter.type) {
      query = query.eq('type', filter.type);
    }
    
    if (filter.provider) {
      query = query.eq('provider', filter.provider);
    }
    
    if (filter.gpid) {
      query = query.eq('gpid', filter.gpid);
    }
    
    if (filter.is_active !== undefined) {
      query = query.eq('is_active', filter.is_active);
    }
    
    if (filter.search) {
      query = query.or(`name.ilike.%${filter.search}%,type.ilike.%${filter.search}%,category.ilike.%${filter.search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Order by rank and name
    query = query.order('rank', { ascending: true }).order('name', { ascending: true });

    console.log(`[${requestId}] 🔍 Executing database query...`);

    const { data: games, error, count } = await query;

    if (error) {
      console.error(`[${requestId}] ❌ Database error:`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`[${requestId}] 📊 Found ${games?.length || 0} games (total: ${count || 0})`);

    // Get unique categories, types, and providers for filter options
    const { data: categories } = await supabase
      .from('games')
      .select('category')
      .not('category', 'is', null);

    const { data: types } = await supabase
      .from('games')
      .select('type')
      .not('type', 'is', null);

    const { data: providers } = await supabase
      .from('games')
      .select('provider')
      .not('provider', 'is', null);

    const { data: gpids } = await supabase
      .from('games')
      .select('gpid')
      .not('gpid', 'is', null);

    // Get unique values
    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])].sort();
    const uniqueTypes = [...new Set(types?.map(t => t.type) || [])].sort();
    const uniqueProviders = [...new Set(providers?.map(p => p.provider) || [])].sort();
    const uniqueGpids = [...new Set(gpids?.map(g => g.gpid) || [])].sort((a, b) => a - b);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`[${requestId}] ✅ Request completed successfully in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          games: games || [],
          pagination: {
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
            offset,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          },
          filters: {
            applied: filter,
            available: {
              categories: uniqueCategories,
              types: uniqueTypes,
              providers: uniqueProviders,
              gpids: uniqueGpids
            }
          }
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
    
    console.error(`[${requestId}] ❌ Error in get-games-from-database function after ${duration}ms:`, error);
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
        error: 'Failed to fetch games from database',
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