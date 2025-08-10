// Test kết nối database trong webhook
const testDBConnection = async () => {
  console.log("🧪 Testing Database Connection in Webhook...");
  
  try {
    // Test với dữ liệu đơn giản để kiểm tra kết nối DB
    console.log("\n📤 Test: Kiểm tra kết nối database...");
    const response = await fetch("http://127.0.0.1:54321/functions/v1/payos-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code: "00",
        desc: "Success",
        data: {
          orderCode: "TEST123456",
          amount: 100000,
          description: "Nạp tiền tài khoản",
          status: "success"
        }
      })
    });
    
    const result = await response.json();
    console.log("📊 Response Status:", response.status);
    console.log("📋 Response Body:", result);
    
    // Phân tích lỗi
    if (response.status === 500) {
      if (result.error === "Server configuration error") {
        console.log("❌ Lỗi: Thiếu environment variables");
        console.log("🔧 Cần cấu hình: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAYOS_CHECKSUM_KEY");
      } else if (result.error === "Database error") {
        console.log("❌ Lỗi: Không thể kết nối database");
        console.log("🔧 Kiểm tra: SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY");
      } else {
        console.log("❌ Lỗi khác:", result.error);
      }
    } else if (response.status === 200) {
      console.log("✅ Kết nối database thành công");
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Chạy test
testDBConnection();
