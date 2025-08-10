// Test webhook đơn giản - bypass signature verification
const testWebhookSimple = async () => {
  console.log("🧪 Testing PayOS Webhook (Simple Mode)...");
  
  try {
    // Test với dữ liệu thành công nhưng không có signature
    console.log("\n📤 Test: Gửi callback thành công (không có signature)...");
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
    
    if (response.status === 200) {
      console.log("✅ Webhook hoạt động bình thường");
    } else {
      console.log("❌ Webhook có vấn đề");
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Chạy test
testWebhookSimple();
