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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('=== WITHDRAW API STARTED ===');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Parse request body with error handling
    let requestBody;
    try {
      // Log raw request info for debugging
      console.log('Request method:', req.method);
      console.log('Request headers:', Object.fromEntries(req.headers.entries()));
      
      // Get raw body first
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      
      // Try to parse as JSON
      if (rawBody && rawBody.trim()) {
        try {
          requestBody = JSON.parse(rawBody);
          console.log('Request body parsed:', requestBody);
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Invalid JSON format',
            details: jsonError.message
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        console.error('Empty request body');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Empty request body',
          details: 'Request body is empty or contains only whitespace'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      console.error('Parse error details:', {
        name: parseError.name,
        message: parseError.message,
        stack: parseError.stack
      });
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON in request body',
        details: parseError.message
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
    console.log('Third-party API response headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 200) {
      let responseData;
      try {
        responseData = await response.json();
        console.log('Third-party API response data:', responseData);
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
      
      // Check if withdrawal was successful based on error.msg
      if (responseData?.error?.msg === "No Error") {
        // Transform balance for transaction (multiply by 1000)
        const transactionAmount = responseData.balance ? responseData.balance * 1000 : amount;
        
        console.log('Creating transaction record...');
        
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
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('id')
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
        
        const userId = userData.id;
        
        // Create transaction record with pending status
        const { error: dbError } = await supabaseClient
          .from('transactions')
          .insert([
            {
              user_id: userId,
              type: 'withdrawal',
              amount: transactionAmount, // Use balance * 1000
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

        console.log('Transaction created successfully with pending status');
        
        // Transform the balance from API response (multiply by 1000)
        const transformedBalance = responseData.amount ? responseData.amount * 1000 : 0;
        const transformedOutstanding = responseData.outstanding ? responseData.outstanding * 1000 : 0;
        
        console.log('Response transformation:', { 
          originalBalance: responseData.balance, 
          transformedBalance,
          originalOutstanding: responseData.outstanding,
          transformedOutstanding,
          requestAmount: amount,
          txnId: responseData.txnId,
          refno: responseData.refno
        });
        
        return new Response(JSON.stringify({ 
          success: true,
          status: response.status,
          amount: amount, // Return original requested amount
          balance: transformedBalance,
          outstanding: transformedOutstanding,
          txnId: responseData.txnId,
          refno: responseData.refno,
          message: 'Withdrawal processed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.error('Third-party API returned error:', responseData.error);
        return new Response(JSON.stringify({ 
          success: false,
          status: response.status,
          message: responseData.error?.msg || 'Withdrawal failed',
          error: responseData.error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.error('Third-party API returned error status:', response.status);
      
      // Try to get error response body
      let errorBody = '';
      try {
        errorBody = await response.text();
        console.error('Third-party API error response body:', errorBody);
      } catch (textError) {
        console.error('Could not read error response body:', textError);
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        status: response.status,
        message: 'Withdrawal failed at third-party service',
        error: errorBody || 'Unknown error'
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