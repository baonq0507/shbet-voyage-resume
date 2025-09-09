#!/usr/bin/env node

console.log("=== Kiểm tra biến môi trường ===");

// Kiểm tra các biến môi trường cần thiết
const requiredEnvVars = [
  'PAYOS_CLIENT_ID',
  'PAYOS_API_KEY', 
  'PAYOS_CHECKSUM_KEY',
  'RECEIVER_BANK_CODE',
  'RECEIVER_ACCOUNT_NUMBER',
  'RECEIVER_ACCOUNT_NAME'
];

console.log("\n🔍 Kiểm tra biến môi trường:");
let allSet = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== `your_${varName.toLowerCase()}_here`) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Không được thiết lập hoặc giá trị mẫu`);
    allSet = false;
  }
});

console.log("\n📊 Kết quả:");
if (allSet) {
  console.log("🎉 Tất cả biến môi trường đã được thiết lập đúng!");
  console.log("🚀 Bạn có thể chạy Edge Functions bây giờ.");
} else {
  console.log("⚠️  Một số biến môi trường chưa được thiết lập.");
  console.log("\n📝 Hướng dẫn khắc phục:");
  console.log("1. Chỉnh sửa file env.example với thông tin thực tế");
  console.log("2. Chạy: source env.example");
  console.log("3. Hoặc chạy: ./setup-env.sh");
  console.log("4. Hoặc thiết lập qua Supabase CLI: supabase secrets set KEY=VALUE");
}

console.log("\n🔧 Để thiết lập biến môi trường:");
console.log("export PAYOS_CLIENT_ID=your_actual_client_id");
console.log("export PAYOS_API_KEY=your_actual_api_key");
console.log("export PAYOS_CHECKSUM_KEY=your_actual_checksum_key");
console.log("export RECEIVER_BANK_CODE=VCB");
console.log("export RECEIVER_ACCOUNT_NUMBER=1234567890");
console.log("export RECEIVER_ACCOUNT_NAME=\"NGUYEN VAN A\"");

console.log("\n📚 Xem file EDGE_FUNCTIONS_ENV_SETUP.md để biết thêm chi tiết.");
