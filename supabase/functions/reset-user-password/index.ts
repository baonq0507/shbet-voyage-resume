import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

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
    const { userId, email, fullName } = await req.json();

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate a new temporary password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    console.log('🔄 Resetting password for user:', userId);

    // Update user password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    console.log('✅ Password updated successfully');

    // Here you would typically send an email with the new password
    // For now, we'll just log it (in production, use a proper email service)
    console.log(`📧 New password for ${fullName} (${email}): ${newPassword}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset successfully',
        // In production, don't return the password in the response
        newPassword: newPassword // Only for development/testing
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('💥 Reset password error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while resetting password'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});