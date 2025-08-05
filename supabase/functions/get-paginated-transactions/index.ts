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
    const searchTransactionType = url.searchParams.get('searchTransactionType') || '';
    const searchAmountMin = url.searchParams.get('searchAmountMin') || '';
    const searchAmountMax = url.searchParams.get('searchAmountMax') || '';
    const searchDateFrom = url.searchParams.get('searchDateFrom') || '';
    const searchDateTo = url.searchParams.get('searchDateTo') || '';
    const searchUserInfo = url.searchParams.get('searchUserInfo') || '';

    console.log('Pagination params:', { page, limit });
    console.log('Search params:', { searchTransactionType, searchAmountMin, searchAmountMax, searchDateFrom, searchDateTo, searchUserInfo });

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build base query for transactions
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    // Apply transaction filters
    if (searchTransactionType) {
      query = query.eq('type', searchTransactionType);
    }

    if (searchAmountMin) {
      query = query.gte('amount', parseFloat(searchAmountMin));
    }

    if (searchAmountMax) {
      query = query.lte('amount', parseFloat(searchAmountMax));
    }

    if (searchDateFrom) {
      const startDate = new Date(searchDateFrom);
      query = query.gte('created_at', startDate.toISOString());
    }

    if (searchDateTo) {
      const endDate = new Date(searchDateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Execute query with pagination
    const { data: transactions, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    // Get user profiles for the transactions
    let enrichedTransactions = transactions;
    if (transactions && transactions.length > 0) {
      const userIds = [...new Set(transactions.map(t => t.user_id))];
      
      // Get profiles for each unique user_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, balance, phone_number')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      } else {
        // Apply user info filter if specified
        let filteredProfiles = profileData;
        if (searchUserInfo) {
          const userInfo = searchUserInfo.toLowerCase();
          filteredProfiles = profileData?.filter(profile => 
            profile.full_name?.toLowerCase().includes(userInfo) ||
            profile.username?.toLowerCase().includes(userInfo) ||
            profile.phone_number?.toLowerCase().includes(userInfo)
          ) || [];
        }

        // Only include transactions from matching users
        if (searchUserInfo && filteredProfiles) {
          const matchingUserIds = filteredProfiles.map(p => p.user_id);
          enrichedTransactions = transactions.filter(t => matchingUserIds.includes(t.user_id));
        }

        // Get banks for each unique bank_id
        const bankIds = [...new Set(enrichedTransactions.map(t => t.bank_id).filter(Boolean))];
        let bankData = [];
        if (bankIds.length > 0) {
          const { data: banks, error: bankError } = await supabase
            .from('bank')
            .select('id, bank_name, account_number')
            .in('id', bankIds);
          
          if (bankError) {
            console.error('Error fetching banks:', bankError);
          } else {
            bankData = banks || [];
          }
        }

        // Combine data
        enrichedTransactions = enrichedTransactions.map(transaction => {
          const profile = profileData?.find(p => p.user_id === transaction.user_id);
          const bank = bankData?.find(b => b.id === transaction.bank_id);
          
          return {
            ...transaction,
            profiles: profile,
            bank: bank
          };
        });
      }
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const response = {
      data: enrichedTransactions,
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
    console.error('Error in get-paginated-transactions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});