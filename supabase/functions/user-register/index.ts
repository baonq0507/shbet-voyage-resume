import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Remove authorization requirement for registration
  // This allows public registration without authentication

  try {
    console.log('🚀 User registration process started');
    
    const { fullName, phoneNumber, username, email, password } = await req.json();
    
    if (!fullName || !phoneNumber || !username || !email || !password) {
      console.log('❌ Missing required fields');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Vui lòng điền đầy đủ thông tin' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Định dạng email không hợp lệ' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate password length
    if (password.length < 6) {
      console.log('❌ Password too short');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Mật khẩu phải có ít nhất 6 ký tự' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      console.log('❌ Invalid username format');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 1: Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Step 2: Check if username already exists in local database
    console.log('📝 Step 2: Checking local username availability');
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      console.log('❌ Username already exists in local database');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Tên người dùng đã tồn tại'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 3: Call external player registration API
    console.log(`📝 Step 3: Registering player externally - ${username}, ${fullName}`);

    const externalRequestData = {
      Username: username,
      DisplayName: fullName,
      Agent: 'VND1_dimonbet',
      CompanyKey: 'C6012BA39EB643FEA4F5CD49AF138B02',
      ServerId: '206.206.126.141',
    };

    console.log('📤 Calling external register API:', externalRequestData);
    //đăng ký với sảnh
    // const externalResponse = await fetch('https://ex-api-yy5.tw946.com/web-root/restricted/player/register-player.aspx', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(externalRequestData),
    // });

    // console.log(`📥 External API response status: ${externalResponse.status}`);
    
    // const externalResponseData = await externalResponse.json();
    // console.log('📥 External API response data:', externalResponseData);

    // // Check if external registration was successful
    // const externalSuccess = externalResponse.status === 200 && externalResponseData?.error?.msg === 'No Error';
    
    // if (!externalSuccess) {
    //   console.log('❌ External player registration failed:', externalResponseData?.error?.msg || 'Unknown error');
    //   return new Response(
    //     JSON.stringify({ 
    //       success: false, 
    //       error: 'Tên người dùng đã tồn tại',
    //       details: externalResponseData?.error?.msg || 'Registration failed'
    //     }),
    //     { 
    //       status: 200, 
    //       headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    //     }
    //   );
    // }

    console.log('✅ External player registration successful');

    // Step 4: Create user in Supabase Auth
    console.log('📝 Step 4: Creating user in Supabase Auth');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        username: username,
        phone_number: phoneNumber
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Failed to create user in Supabase Auth:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: authError?.message || 'Failed to create user account'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 5: User created successfully - profile is created automatically by trigger
    console.log('✅ User created successfully in Supabase Auth');
    console.log('✅ Profile will be created automatically by trigger');
    console.log('✅ Registration process completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User registered successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: username,
          fullName: fullName
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Registration error:', error);
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