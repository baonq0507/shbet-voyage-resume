import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req) => {
  console.log('=== WITHDRAW API FUNCTION CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('=== WITHDRAW API STARTED ===');
    
    // Parse request body
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      
      if (!rawBody || !rawBody.trim()) {
        console.error('Empty request body');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Empty request body'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      requestBody = JSON.parse(rawBody);
      console.log('Parsed request body:', requestBody);
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
    
    const { username, amount } = requestBody;

    // Validate required fields
    if (!username || !amount) {
      console.error('Missing required fields:', { username, amount });
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields: username and amount'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing withdrawal for:', { username, amount });

    // Transform amount based on business rules
    const apiAmount = amount < 10000 ? amount / 1000 : amount;
    console.log('Amount transformation:', { originalAmount: amount, apiAmount });

    // Call third-party API
    console.log('Calling third-party API...');
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

    // Always try to get response body first
    let responseData;
    try {
      const responseText = await response.text();
      console.log('Third-party API response text:', responseText);
      
      if (responseText) {
        responseData = JSON.parse(responseText);
        console.log('Third-party API response data:', responseData);
      }
    } catch (parseError) {
      console.error('Error parsing third-party response:', parseError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid response from third-party service',
        status: response.status
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check success condition like deposit API
    const success = responseData?.error?.msg === "No Error";
    console.log('API Success check:', { success, errorMsg: responseData?.error?.msg });

    if (success) {
      console.log('Withdrawal successful, creating transaction record...');
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase environment variables');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Server configuration error'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get user ID from username
      console.log('Looking up user by username:', username);
      const { data: userData, error: userError } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .single();
        
      if (userError || !userData) {
        console.error('User not found:', userError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'User not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const userId = userData.user_id;
      console.log('Found user ID:', userId);
      
      // Create transaction record with pending status
      const { error: dbError } = await supabaseClient
        .from('transactions')
        .insert([
          {
            user_id: userId,
            type: 'withdrawal',
            amount: amount, // Use original amount
            status: 'pending'
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
      
      // Transform response data
      const transformedBalance = responseData.balance ? responseData.balance * 1000 : 0;
      const transformedOutstanding = responseData.outstanding ? responseData.outstanding * 1000 : 0;
      
      return new Response(JSON.stringify({ 
        success: true,
        status: response.status,
        amount: amount,
        balance: transformedBalance,
        outstanding: transformedOutstanding,
        txnId: responseData.txnId,
        refno: responseData.refno,
        message: 'Withdrawal processed successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Third-party API returned error:', responseData?.error);
      return new Response(JSON.stringify({ 
        success: false,
        status: response.status,
        message: responseData?.error?.msg || 'Withdrawal failed',
        error: responseData?.error || 'Unknown error'
      }), {
        status: 400,
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