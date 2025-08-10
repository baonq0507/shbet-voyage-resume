// Test webhook với dữ liệu PayOS thực tế
const testWebhook = async () => {
  // Dữ liệu mô phỏng callback thành công từ PayOS
  const mockPayOSSuccess = {
    code: "00",
    desc: "Success",
    data: {
      orderCode: "TEST123456",
      amount: 100000,
      description: "Nạp tiền tài khoản",
      status: "success"
    }
  };

  // Dữ liệu mô phỏng callback thất bại từ PayOS
  const mockPayOSFailed = {
    code: "01",
    desc: "Payment failed",
    data: {
      orderCode: "TEST123456",
      amount: 100000,
      description: "Nạp tiền tài khoản",
      status: "failed"
    }
  };

  console.log("🧪 Testing PayOS Webhook...");
  
  try {
    // Test 1: Callback thành công
    console.log("\n📤 Test 1: Gửi callback thành công...");
    const successResponse = await fetch("http://127.0.0.1:54321/functions/v1/payos-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-payos-signature": "test-signature"
      },
      body: JSON.stringify(mockPayOSSuccess)
    });
    
    const successResult = await successResponse.json();
    console.log("✅ Success Response:", successResult);
    console.log("📊 Status Code:", successResponse.status);

    // Test 2: Callback thất bại
    console.log("\n📤 Test 2: Gửi callback thất bại...");
    const failedResponse = await fetch("http://127.0.0.1:54321/functions/v1/payos-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-payos-signature": "test-signature"
      },
      body: JSON.stringify(mockPayOSFailed)
    });
    
    const failedResult = await failedResponse.json();
    console.log("❌ Failed Response:", failedResult);
    console.log("📊 Status Code:", failedResponse.status);

    // Test 3: Dữ liệu không hợp lệ
    console.log("\n📤 Test 3: Gửi dữ liệu không hợp lệ...");
    const invalidResponse = await fetch("http://127.0.0.1:54321/functions/v1/payos-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ invalid: "data" })
    });
    
    const invalidResult = await invalidResponse.json();
    console.log("⚠️ Invalid Response:", invalidResult);
    console.log("📊 Status Code:", invalidResponse.status);

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Chạy test
testWebhook();
