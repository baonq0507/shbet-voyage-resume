import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Register player API called');
    
    const { username, displayName } = await req.json();
    
    if (!username || !displayName) {
      console.log('❌ Missing required fields');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Username and DisplayName are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📝 Registering player: ${username}, ${displayName}`);

    const requestData = {
      Username: username,
      DisplayName: displayName,
      Agent: 'VND1_dimonbet',
      CompanyKey: 'C6012BA39EB643FEA4F5CD49AF138B02',
      ServerId: '206.206.126.141',
    };

    console.log('📤 Sending request to external API:', requestData);

    const response = await fetch('https://ex-api-yy5.tw946.com/web-root/restricted/player/register-player.aspx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log(`📥 External API response status: ${response.status}`);
    
    const responseData = await response.json();
    console.log('📥 External API response data:', responseData);

    // Check if registration was successful
    const success = response.status === 200 && responseData?.error?.msg === 'No Error';
    
    if (success) {
      console.log('✅ Player registration successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Player registered successfully',
          data: responseData 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.log('❌ Player registration failed:', responseData?.error?.msg || 'Unknown error');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Username already exists',
          details: responseData?.error?.msg || 'Registration failed'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('💥 Register player error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});