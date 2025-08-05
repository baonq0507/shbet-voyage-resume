// Script tạo admin user mới
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://api.dinamondbet68.com/';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Hàm validate email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Hàm validate mật khẩu
function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      error: 'Mật khẩu phải có ít nhất 6 ký tự'
    };
  }
  return { isValid: true };
}

// Hàm kiểm tra admin user đã tồn tại
async function checkAdminExists() {
  try {
    const { data: adminRoles, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (error) {
      console.error('❌ Lỗi khi kiểm tra admin:', error);
      return false;
    }
    
    return adminRoles && adminRoles.length > 0;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra admin:', error);
    return false;
  }
}

// Hàm tạo admin user
async function createAdminUser(email, password, username = 'admin') {
  console.log('🔄 Đang tạo admin user...');
  
  try {
    // Kiểm tra email đã tồn tại chưa
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Lỗi khi kiểm tra user:', checkError);
      return false;
    }
    
    const userExists = existingUser.users.some(user => user.email === email);
    
    if (userExists) {
      console.log('❌ Email đã tồn tại trong hệ thống');
      return false;
    }
    
    // Tạo user mới
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
        full_name: 'Administrator'
      }
    });
    
    if (createError) {
      console.error('❌ Lỗi khi tạo user:', createError);
      return false;
    }
    
    if (!newUser.user) {
      console.log('❌ Không thể tạo user');
      return false;
    }
    
    console.log('✅ User đã được tạo:', newUser.user.email);
    
    // Tạo profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        username: username,
        full_name: 'Administrator'
      });
    
    if (profileError) {
      console.error('❌ Lỗi khi tạo profile:', profileError);
      // Vẫn tiếp tục vì user đã được tạo
    } else {
      console.log('✅ Profile đã được tạo');
    }
    
    // Gán role admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'admin'
      });
    
    if (roleError) {
      console.error('❌ Lỗi khi gán role admin:', roleError);
      return false;
    }
    
    console.log('✅ Role admin đã được gán');
    
    return {
      success: true,
      user: newUser.user
    };
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin user:', error);
    return false;
  }
}

// Hàm chính
async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const username = process.argv[4] || 'admin';
  
  if (!email || !password) {
    console.log('🔐 Script Tạo Admin User');
    console.log('==========================');
    console.log('Cách sử dụng:');
    console.log('  node create-admin-user.js <email> <mật_khẩu> [username]');
    console.log('');
    console.log('Ví dụ:');
    console.log('  node create-admin-user.js admin@example.com Admin123! admin');
    console.log('  node create-admin-user.js admin@example.com Admin123!');
    console.log('');
    console.log('Lưu ý:');
    console.log('  - Email phải hợp lệ');
    console.log('  - Mật khẩu phải có ít nhất 6 ký tự');
    console.log('  - Username là tùy chọn (mặc định: admin)');
    return;
  }
  
  console.log('🔐 Tạo Admin User');
  console.log('==================');
  
  // Validate email
  if (!validateEmail(email)) {
    console.log('❌ Email không hợp lệ');
    process.exit(1);
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    console.log('❌', passwordValidation.error);
    process.exit(1);
  }
  
  console.log('📧 Email:', email);
  console.log('👤 Username:', username);
  
  // Kiểm tra admin đã tồn tại
  const adminExists = await checkAdminExists();
  if (adminExists) {
    console.log('⚠️  Admin user đã tồn tại trong hệ thống');
    console.log('💡 Sử dụng script change-admin-password.js để đổi mật khẩu');
    process.exit(1);
  }
  
  // Tạo admin user
  const result = await createAdminUser(email, password, username);
  
  if (result && result.success) {
    console.log('\n🎉 Hoàn thành! Admin user đã được tạo thành công.');
    console.log('📧 Email:', result.user.email);
    console.log('🆔 User ID:', result.user.id);
    console.log('👤 Username:', username);
    console.log('🔑 Mật khẩu:', password);
    console.log('');
    console.log('📝 Lưu ý: Vui lòng lưu thông tin đăng nhập vào nơi an toàn.');
  } else {
    console.log('\n❌ Không thể tạo admin user. Vui lòng thử lại.');
    process.exit(1);
  }
}

// Chạy script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createAdminUser, checkAdminExists, validateEmail, validatePassword }; 