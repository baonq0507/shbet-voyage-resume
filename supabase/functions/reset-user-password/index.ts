import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    let actualUserId = userId;
    let actualFullName = fullName;
    let actualEmail = email;

    // If only email is provided, look up the user
    if (!userId && email) {
      console.log('🔍 Looking up user by email:', email);
      
      // Get user by email from auth.users
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Adjust as needed
      });

      if (authError) {
        console.error('❌ Error listing users:', authError);
        throw new Error('Failed to lookup user');
      }

      const userByEmail = authUser.users.find(u => u.email === email);
      if (!userByEmail) {
        throw new Error('Không tìm thấy tài khoản với email này');
      }

      actualUserId = userByEmail.id;
      actualEmail = userByEmail.email || email;

      // Get full name from profiles table
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('user_id', actualUserId)
        .single();

      if (!profileError && profile) {
        actualFullName = profile.full_name;
      } else {
        actualFullName = userByEmail.user_metadata?.full_name || 'Người dùng';
      }
    }

    if (!actualUserId) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    // Generate a new temporary password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    console.log('🔄 Resetting password for user:', actualUserId);

    // Update user password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      actualUserId,
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

    // Send email with new password
    try {
      if (Deno.env.get("RESEND_API_KEY")) {
        const emailResponse = await resend.emails.send({
          from: "DINAMONDBET68 <noreply@resend.dev>",
          to: [actualEmail],
          subject: "Mật khẩu mới của bạn - DINAMONDBET68",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; text-align: center;">DINAMONDBET68</h2>
              <h3 style="color: #666;">Xin chào ${actualFullName},</h3>
              <p>Bạn đã yêu cầu reset mật khẩu cho tài khoản của mình.</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Mật khẩu mới của bạn:</h4>
                <p style="font-size: 18px; font-weight: bold; color: #e74c3c; margin: 0; font-family: monospace;">${newPassword}</p>
              </div>
              <p><strong>Lưu ý quan trọng:</strong></p>
              <ul>
                <li>Vui lòng đổi mật khẩu này ngay sau khi đăng nhập thành công</li>
                <li>Không chia sẻ mật khẩu này với bất kỳ ai</li>
                <li>Đây là mật khẩu tạm thời để bảo mật tài khoản của bạn</li>
              </ul>
              <p>Nếu bạn không yêu cầu reset mật khẩu, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px; text-align: center;">
                Email này được gửi tự động từ hệ thống DINAMONDBET68<br>
                Vui lòng không trả lời email này.
              </p>
            </div>
          `,
        });

        console.log('📧 Email sent successfully:', emailResponse);
      } else {
        console.log('⚠️ No RESEND_API_KEY configured, skipping email send');
      }
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // Don't throw error here, password was still reset successfully
    }

    console.log(`📧 New password for ${actualFullName} (${actualEmail}): ${newPassword}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mật khẩu đã được reset và gửi đến email của bạn',
        emailSent: !!Deno.env.get("RESEND_API_KEY")
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