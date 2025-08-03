import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const searchName = url.searchParams.get('searchName') || '';
    const searchEmail = url.searchParams.get('searchEmail') || '';
    const searchBalanceMin = url.searchParams.get('searchBalanceMin') || '';
    const searchBalanceMax = url.searchParams.get('searchBalanceMax') || '';
    const searchCreatedDate = url.searchParams.get('searchCreatedDate') || '';
    const searchDepositType = url.searchParams.get('searchDepositType') || '';

    console.log('Pagination params:', { page, limit });
    console.log('Search params:', { searchName, searchEmail, searchBalanceMin, searchBalanceMax, searchCreatedDate, searchDepositType });

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply search filters
    if (searchName) {
      query = query.or(`full_name.ilike.%${searchName}%,username.ilike.%${searchName}%`);
    }

    if (searchEmail) {
      query = query.ilike('username', `%${searchEmail}%`);
    }

    if (searchBalanceMin) {
      query = query.gte('balance', parseFloat(searchBalanceMin));
    }

    if (searchBalanceMax) {
      query = query.lte('balance', parseFloat(searchBalanceMax));
    }

    if (searchCreatedDate) {
      const startDate = new Date(searchCreatedDate);
      const endDate = new Date(searchCreatedDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query = query
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString());
    }

    // Execute query with pagination
    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    // Get deposit stats for users if needed
    let enrichedUsers = users;
    if (searchDepositType && users && users.length > 0) {
      const userIds = users.map(u => u.user_id);
      
      // Get transaction stats
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('user_id, amount')
        .in('user_id', userIds)
        .eq('type', 'deposit')
        .eq('status', 'approved');

      if (transError) {
        console.error('Error fetching transactions:', transError);
      } else {
        // Calculate deposit stats for each user
        const depositStats = new Map();
        transactions?.forEach(t => {
          const current = depositStats.get(t.user_id) || 0;
          depositStats.set(t.user_id, current + t.amount);
        });

        // Filter based on deposit type
        if (searchDepositType === 'highest') {
          const maxDeposit = Math.max(...Array.from(depositStats.values()));
          enrichedUsers = users.filter(u => (depositStats.get(u.user_id) || 0) === maxDeposit);
        } else if (searchDepositType === 'lowest') {
          const depositsArray = Array.from(depositStats.values()).filter(v => v > 0);
          if (depositsArray.length > 0) {
            const minDeposit = Math.min(...depositsArray);
            enrichedUsers = users.filter(u => (depositStats.get(u.user_id) || 0) === minDeposit);
          } else {
            enrichedUsers = [];
          }
        } else if (searchDepositType === 'none') {
          enrichedUsers = users.filter(u => !depositStats.has(u.user_id) || depositStats.get(u.user_id) === 0);
        }
      }
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const response = {
      data: enrichedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    console.log('Response pagination:', response.pagination);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-paginated-users function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});