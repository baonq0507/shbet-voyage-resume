// Script đổi mật khẩu admin đơn giản với tham số dòng lệnh
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://api.dinamondbet68.com/';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Hàm validate mật khẩu đơn giản
function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      error: 'Mật khẩu phải có ít nhất 6 ký tự'
    };
  }
  return { isValid: true };
}

// Hàm tìm admin user
async function findAdminUser() {
  console.log('🔍 Đang tìm admin user...');
  
  try {
    // Tìm user có role admin
    const { data: adminRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (roleError) {
      console.error('❌ Lỗi khi tìm admin roles:', roleError);
      return null;
    }
    
    if (!adminRoles || adminRoles.length === 0) {
      console.log('❌ Không tìm thấy admin user');
      return null;
    }
    
    // Lấy thông tin user đầu tiên có role admin
    const adminUserId = adminRoles[0].user_id;
    
    const { data: adminUser, error: userError } = await supabase.auth.admin.getUserById(adminUserId);
    
    if (userError) {
      console.error('❌ Lỗi khi lấy thông tin admin user:', userError);
      return null;
    }
    
    if (!adminUser.user) {
      console.log('❌ Không tìm thấy thông tin admin user');
      return null;
    }
    
    console.log('✅ Tìm thấy admin user:', adminUser.user.email);
    return adminUser.user;
    
  } catch (error) {
    console.error('❌ Lỗi khi tìm admin user:', error);
    return null;
  }
}

// Hàm đổi mật khẩu admin
async function changeAdminPassword(newPassword) {
  console.log('🔄 Đang đổi mật khẩu admin...');
  
  try {
    // Validate mật khẩu
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      console.error('❌', validation.error);
      return false;
    }
    
    // Tìm admin user
    const adminUser = await findAdminUser();
    
    if (!adminUser) {
      console.log('❌ Không thể tìm thấy admin user');
      return false;
    }
    
    // Đổi mật khẩu bằng Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: newPassword }
    );
    
    if (error) {
      console.error('❌ Lỗi khi đổi mật khẩu:', error);
      return false;
    }
    
    console.log('✅ Đổi mật khẩu thành công!');
    console.log('📧 Email admin:', adminUser.email);
    console.log('🆔 User ID:', adminUser.id);
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi đổi mật khẩu:', error);
    return false;
  }
}

// Hàm chính
async function main() {
  const newPassword = process.argv[2];
  
  if (!newPassword) {
    console.log('🔐 Script Đổi Mật Khẩu Admin');
    console.log('================================');
    console.log('Cách sử dụng:');
    console.log('  node change-admin-password-simple.js <mật_khẩu_mới>');
    console.log('');
    console.log('Ví dụ:');
    console.log('  node change-admin-password-simple.js Admin123!');
    console.log('');
    console.log('Lưu ý: Mật khẩu phải có ít nhất 6 ký tự');
    return;
  }
  
  console.log('🔐 Đổi Mật Khẩu Admin');
  console.log('======================');
  
  const success = await changeAdminPassword(newPassword);
  
  if (success) {
    console.log('\n🎉 Hoàn thành! Mật khẩu admin đã được đổi thành công.');
    console.log('📝 Lưu ý: Vui lòng lưu mật khẩu mới vào nơi an toàn.');
  } else {
    console.log('\n❌ Không thể đổi mật khẩu. Vui lòng thử lại.');
    process.exit(1);
  }
}

// Chạy script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { changeAdminPassword, findAdminUser, validatePassword }; 