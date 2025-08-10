/// <reference types="https://deno.land/x/deno@v1.40.4/types.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const requestId = Math.random().toString(36).substring(7);
  
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] 🔄 CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log(`[${requestId}] 🌐 New request received - Method: ${req.method}`);
    
    // Parse query parameters
    const url = new URL(req.url);
    const grantType = url.searchParams.get('grant_type');
    
    if (grantType !== 'password') {
      console.log(`[${requestId}] ❌ Unsupported grant_type: ${grantType}`);
      return new Response(
        JSON.stringify({ error: 'Only password grant type is supported' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body (form data for OAuth2)
    let requestBody;
    try {
      const formData = await req.formData();
      const username = formData.get('username');
      const password = formData.get('password');
      
      if (!username || !password) {
        console.log(`[${requestId}] ❌ Missing username or password`);
        return new Response(
          JSON.stringify({ error: 'Username and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      requestBody = { username: username.toString(), password: password.toString() };
      console.log(`[${requestId}] 📥 Request body parsed:`, { username: requestBody.username, password: '***' });
    } catch (parseError) {
      console.log(`[${requestId}] ❌ Failed to parse form data:`, parseError.message);
      return new Response(
        JSON.stringify({ error: 'Invalid form data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { username, password } = requestBody;

    console.log(`[${requestId}] 👤 Processing login for username: ${username}`);

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.log(`[${requestId}] ❌ Missing environment variables:`, {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        hasAnonKey: !!supabaseAnonKey
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] 🔧 Environment variables loaded successfully`);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log(`[${requestId}] 🔌 Supabase clients created`);

    // Find user by username
    console.log(`[${requestId}] 🔍 Looking up user profile for username: ${username}`);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .single()

    if (profileError) {
      console.log(`[${requestId}] ❌ Profile lookup error:`, profileError);
      return new Response(
        JSON.stringify({ error: 'Username not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profile) {
      console.log(`[${requestId}] ❌ No profile found for username: ${username}`);
      return new Response(
        JSON.stringify({ error: 'Username not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] ✅ Profile found for user_id: ${profile.user_id}`);

    // Get user email from auth.users
    console.log(`[${requestId}] 🔍 Looking up auth user for user_id: ${profile.user_id}`);
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.user_id)
    
    if (authError) {
      console.log(`[${requestId}] ❌ Auth user lookup error:`, authError);
      return new Response(
        JSON.stringify({ error: 'User authentication error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authUser.user?.email) {
      console.log(`[${requestId}] ❌ No email found for user_id: ${profile.user_id}`);
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${requestId}] ✅ Auth user found with email: ${authUser.user.email}`);

    // Perform actual password verification using Supabase Auth
    console.log(`[${requestId}] 🔐 Verifying password for user: ${authUser.user.email}`);
    
    try {
      // First, let's check if the user exists and get more details
      console.log(`[${requestId}] 🔍 Checking user details in auth system`);
      const { data: userDetails, error: userDetailsError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userDetailsError) {
        console.log(`[${requestId}] ❌ Error listing users:`, userDetailsError);
      } else {
        const targetUser = userDetails.users.find(user => user.id === profile.user_id);
        if (targetUser) {
          console.log(`[${requestId}] ℹ️ User found in auth system:`, {
            id: targetUser.id,
            email: targetUser.email,
            email_confirmed_at: targetUser.email_confirmed_at,
            created_at: targetUser.created_at,
            last_sign_in_at: targetUser.last_sign_in_at
          });
        } else {
          console.log(`[${requestId}] ⚠️ User not found in auth.users list`);
        }
      }

      // Attempt to sign in with the provided password
      console.log(`[${requestId}] 🔐 Attempting sign in with email: ${authUser.user.email}`);
      const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
        email: authUser.user.email,
        password: password
      });

      if (signInError) {
        console.log(`[${requestId}] ❌ Password verification failed:`, signInError);
        console.log(`[${requestId}] ❌ Error details:`, {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name
        });
        
        // Provide more specific error messages
        let errorMessage = 'Invalid credentials';
        if (signInError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid username or password';
        } else if (signInError.message.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed';
        } else if (signInError.message.includes('User not found')) {
          errorMessage = 'User not found';
        }
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            details: signInError.message,
            code: signInError.status || 'AUTH_ERROR'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!signInData.user || !signInData.session) {
        console.log(`[${requestId}] ❌ No user data or session returned from sign in`);
        return new Response(
          JSON.stringify({ error: 'Authentication failed - No session created' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`[${requestId}] ✅ Password verification completed for user: ${signInData.user.email}`);

      // Return OAuth2 token response format
      const response = {
        access_token: signInData.session.access_token,
        token_type: 'bearer',
        expires_in: signInData.session.expires_in,
        refresh_token: signInData.session.refresh_token,
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
          username: username
        }
      };
      
      console.log(`[${requestId}] ✅ Request completed successfully - Token generated`);

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (authError) {
      console.log(`[${requestId}] ❌ Authentication error:`, authError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          details: authError.message,
          code: 'AUTH_EXCEPTION'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error(`[${requestId}] 💥 Unexpected error:`, error);
    console.error(`[${requestId}] 💥 Error stack:`, error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected server error',
        message: error.message,
        requestId: requestId
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
