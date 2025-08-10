import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GameLoginRequest {
  gpid: number;
  username: string;
  isSports?: boolean;
}

interface GameLoginData {
  Username: string;
  IsWapSports: boolean;
  CompanyKey: string;
  Portfolio: string;
  ServerId: string; 
}

interface GameLoginResponse {
  url: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎮 Game login request received');
    
    // Get request data
    const { gpid, username, isSports = false }: GameLoginRequest = await req.json();
    console.log('📥 Request data:', { gpid, username, isSports });

    if (!username) {
      console.log('❌ Username is required');
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('👤 Using username:', username);

    // Prepare game login data
    const gameLoginData: GameLoginData = {
      Username: username,
      IsWapSports: isSports,
      CompanyKey: 'C6012BA39EB643FEA4F5CD49AF138B02',
      Portfolio: isSports ? 'ThirdPartySportsBook' : 'SeamlessGame',
      ServerId: '206.206.126.141',
    };

    console.log('🚀 Calling game API with data:', gameLoginData);

    // Call game login API
    const gameResponse = await fetch('https://ex-api-yy5.tw946.com/web-root/restricted/player/login.aspx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameLoginData)
    });

    console.log('📞 Game API response status:', gameResponse.status);

    if (gameResponse.status !== 200) {
      console.log('❌ Game API returned non-200 status');
      return new Response(
        JSON.stringify({ error: 'Không thể kết nối đến game server' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const gameResult: GameLoginResponse = await gameResponse.json();
    console.log('📤 Game API response data:', gameResult);

    if (!gameResult.url) {
      console.log('❌ No URL in game API response');
      return new Response(
        JSON.stringify({ error: 'Game server không trả về URL hợp lệ' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect device type (default to desktop for server-side)
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const device = isMobile ? 'm' : 'd';

    // Construct final game URL
    const gameUrl = `https://${gameResult.url}&gpid=${gpid}&gameid=0&device=${device}&lang=vi-VN`;
    console.log('🎯 Final game URL constructed:', gameUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        gameUrl: gameUrl,
        message: 'Game URL created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Game login error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Lỗi server khi xử lý yêu cầu đăng nhập game',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});