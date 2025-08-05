import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

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
    console.log('=== WITHDRAW API STARTED ===');
    
    // Parse request body
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { amount } = requestBody;

    // Validate amount
    if (!amount || typeof amount !== 'number') {
      console.error('Invalid amount:', amount);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Valid amount is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Authorization required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with the user's JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user (JWT will be verified automatically)
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid authentication'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log('User authenticated:', userId);

    // Get username from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.username) {
      console.error('Username not found:', profileError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'User profile not found'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const username = profile.username;
    console.log('Username found:', username);

    // Transform amount for third-party API
    const apiAmount = amount < 10000 ? amount / 1000 : amount;
    console.log('Amount transformation:', { originalAmount: amount, apiAmount });

    // Call third-party API
    console.log('Calling third-party withdraw API...');
    const response = await fetch('https://api.tw954.com/withdraw-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        amount: apiAmount,
      }),
    });

    console.log('Third-party API response status:', response.status);

    if (response.status === 200) {
      const responseData = await response.json();
      console.log('Third-party API response data:', responseData);
      
      // Transform balance for transaction (multiply by 1000)
      const transactionAmount = responseData.balance ? responseData.balance * 1000 : amount;
      
      console.log('Creating transaction record...');
      // Create transaction record
      const { error: dbError } = await supabaseClient
        .from('transactions')
        .insert([
          {
            user_id: userId,
            type: 'withdrawal',
            amount: transactionAmount, // Use balance * 1000
            status: 'approved'
          }
        ]);

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Failed to create transaction record'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Transaction created successfully');
      return new Response(JSON.stringify({ 
        success: true,
        amount: transactionAmount,
        message: 'Withdrawal processed successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Third-party API error, status:', response.status);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Withdrawal failed at third-party service'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in withdraw-game-api:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});