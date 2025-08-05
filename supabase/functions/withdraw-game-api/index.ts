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
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', requestBody);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { amount } = requestBody;

    // Validate required fields
    if (!amount) {
      console.error('Missing required field: amount');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required field: amount'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get username from authenticated user's profile
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'User not authenticated'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.username) {
      console.error('Username not found for user:', user.id);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Username not found'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const username = profile.username;
    console.log('Processing withdrawal API call for:', { username, amount });

    // Transform amount based on business rules (same as deposit):
    // If amount < 10000: divide by 1000
    // If amount >= 10000: keep the same
    const apiAmount = amount < 10000 ? amount / 1000 : amount;
    
    console.log('Amount transformation:', { originalAmount: amount, apiAmount });

    // Call third-party API
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
      let responseData;
      try {
        responseData = await response.json();
        console.log('Withdrawal API response data:', responseData);
      } catch (parseError) {
        console.error('Error parsing third-party response:', parseError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid response from third-party service'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Transform the balance from API response (multiply by 1000)
      const transformedAmount = responseData.balance ? responseData.balance * 1000 : amount;
      
      console.log('Amount transformation:', { 
        originalBalance: responseData.balance, 
        transformedAmount,
        requestAmount: amount 
      });

      // Create transaction record in database
      const { error: dbError } = await supabaseClient
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'withdrawal',
            amount: transformedAmount, // Use balance * 1000 as requested
            status: 'approved' // Mark as approved since API was successful
          }
        ]);

      if (dbError) {
        console.error('Database error creating transaction:', dbError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Failed to create transaction record'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        status: response.status,
        amount: transformedAmount,
        message: 'Withdrawal processed successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Third-party API returned error status:', response.status);
      return new Response(JSON.stringify({ 
        success: false,
        status: response.status,
        message: 'Withdrawal failed at third-party service'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in withdraw-game-api function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});