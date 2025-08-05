import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GameLoginRequest {
  gpid: number;
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
    const { gpid, isSports = false }: GameLoginRequest = await req.json();
    console.log('📥 Request data:', { gpid, isSports });

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.log('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile using the auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ Invalid user token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.username) {
      console.log('❌ User profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('👤 User found:', profile.username);

    // Prepare game login data
    const gameLoginData: GameLoginData = {
      Username: profile.username,
      IsWapSports: isSports,
      CompanyKey: 'C6012BA39EB643FEA4F5CD49AF138B02',
      Portfolio: isSports ? 'ThirdPartySportsBook' : 'SeamlessGame',
      ServerId: '206.206.126.141'
    };

    console.log('🚀 Calling game API with data:', gameLoginData);

    // Call game login API
    const gameResponse = await fetch('http://206.206.126.141/web-root/restricted/player/login.aspx', {
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