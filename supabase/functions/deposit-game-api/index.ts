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
    const { username, amount } = await req.json();

    console.log('Processing deposit API call for:', { username, amount });

    // Transform amount based on business rules:
    // If amount < 10000: divide by 1000
    // If amount >= 10000: keep the same
    const apiAmount = amount < 10000 ? amount / 1000 : amount;
    
    console.log('Amount transformation:', { originalAmount: amount, apiAmount });

    // // Call third-party API
    const response = await fetch('https://api.tw954.com/deposit-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // username: username,
        username: 'baobongxx'
        amount: apiAmount,
      }),
    });

    console.log('Third-party API response status:', response.status);
    
    const responseData = await response.json();
    console.log('Third-party API response data:', responseData);

    // Check if API call was successful based on error.msg
    const success = responseData?.error?.msg === "No Error";
    const success = true;
    return new Response(JSON.stringify({ 
      success,
      status: response.status,
      message: success ? 'Deposit processed successfully' : responseData?.error?.msg || 'Deposit failed at third-party service',
      data: responseData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in deposit-game-api function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});