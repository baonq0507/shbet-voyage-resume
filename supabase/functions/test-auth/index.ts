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

    // Test database connection
    let dbTest = { success: false, error: null };
    try {
      const { data, error } = await supabaseAdmin.from('profiles').select('count').limit(1);
      dbTest = { success: !error, error: error?.message };
    } catch (e) {
      dbTest = { success: false, error: e.message };
    }

    // Test auth system
    let authTest = { success: false, error: null, userCount: 0 };
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      authTest = { 
        success: !error, 
        error: error?.message,
        userCount: data?.users?.length || 0
      };
    } catch (e) {
      authTest = { success: false, error: e.message, userCount: 0 };
    }

    // Test anon client
    let anonTest = { success: false, error: null };
    try {
      const { data, error } = await supabaseAnon.auth.getSession();
      anonTest = { success: !error, error: error?.message };
    } catch (e) {
      anonTest = { success: false, error: e.message };
    }

    const response = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseServiceKey: supabaseServiceKey ? 'Set' : 'Missing',
        supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Missing'
      },
      tests: {
        database: dbTest,
        auth: authTest,
        anonClient: anonTest
      }
    };

    return new Response(
      JSON.stringify(response, null, 2),
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
