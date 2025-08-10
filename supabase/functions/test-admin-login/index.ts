import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing environment variables',
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
          hasAnonKey: !!supabaseAnonKey
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

    // Test admin login
    const adminEmail = 'admin@admin.com';
    const adminPassword = '123456';

    console.log('Testing admin login with:', { email: adminEmail, password: adminPassword });

    // First, let's check if admin user exists
    const { data: adminUser, error: adminUserError } = await supabaseAdmin.auth.admin.getUserByEmail(adminEmail);
    
    if (adminUserError) {
      return new Response(
        JSON.stringify({ 
          error: 'Admin user lookup failed',
          details: adminUserError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!adminUser.user) {
      return new Response(
        JSON.stringify({ 
          error: 'Admin user not found',
          suggestion: 'Run the migration to create admin user'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Admin user found:', {
      id: adminUser.user.id,
      email: adminUser.user.email,
      email_confirmed_at: adminUser.user.email_confirmed_at
    });

    // Try to sign in with admin credentials
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (signInError) {
      console.log('Admin login failed:', signInError.message);
      
      // If login fails, try to convert password to bcrypt
      try {
        console.log('Attempting to convert admin password to bcrypt...');
        
        // Call the conversion function
        const { data: conversionResult, error: conversionError } = await supabaseAdmin
          .rpc('convert_admin_password_to_bcrypt');
        
        if (conversionError) {
          console.log('Password conversion failed:', conversionError.message);
        } else {
          console.log('Password conversion completed, trying login again...');
          
          // Try login again after conversion
          const { data: retrySignInData, error: retrySignInError } = await supabaseAnon.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
          });
          
          if (retrySignInError) {
            return new Response(
              JSON.stringify({ 
                error: 'Admin login still failed after password conversion',
                details: retrySignInError.message,
                suggestion: 'Check if pgcrypto extension is properly enabled'
              }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          return new Response(
            JSON.stringify({ 
              success: true,
              message: 'Admin login successful after password conversion',
              user: {
                id: retrySignInData.user?.id,
                email: retrySignInData.user?.email
              },
              session: {
                access_token: retrySignInData.session?.access_token ? 'Present' : 'Missing',
                refresh_token: retrySignInData.session?.refresh_token ? 'Present' : 'Missing'
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } catch (conversionException) {
        console.log('Password conversion exception:', conversionException.message);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Admin login failed',
          details: signInError.message,
          suggestion: 'Password may need to be converted from SHA256 to bcrypt'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Login successful
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Admin login successful',
        user: {
          id: signInData.user?.id,
          email: signInData.user?.email
        },
        session: {
          access_token: signInData.session?.access_token ? 'Present' : 'Missing',
          refresh_token: signInData.session?.refresh_token ? 'Present' : 'Missing'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error',
        message: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
