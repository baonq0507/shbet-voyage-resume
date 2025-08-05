import fetch from 'node-fetch';

async function callWithdrawAPI(username) {
  try {
    console.log(`Gọi API với username: ${username}`);
    
    const response = await fetch('https://api.tw954.com/withdraw-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
      }),
    });

    const data = await response.json();
    console.log('Kết quả:', JSON.stringify(data, null, 2));
    
    // In thông báo dựa trên kết quả
    if (data.error && data.error.msg === "No Error") {
      console.log('\n🎉 THÀNH CÔNG!');
      console.log(`💰 Số tiền rút: ${data.amount}`);
      console.log(`🆔 Mã giao dịch: ${data.txnId}`);
      console.log(`🔢 Số tham chiếu: ${data.refno}`);
      console.log(`💳 Số dư hiện tại: ${data.balance}`);
      console.log(`📊 Số tiền đang xử lý: ${data.outstanding}`);
      console.log(`🖥️  Máy chủ: ${data.serverId}`);
    } else {
      console.log('\n❌ THẤT BẠI!');
      console.log(`📝 Lỗi: ${data.error?.msg || 'Không xác định'}`);
    }
    
    return data;
  } catch (error) {
    console.error('Lỗi:', error.message);
    return null;
  }
}

// Lấy tham số từ command line
const username = process.argv[2];

if (!username) {
  console.log('Cách sử dụng: node call-withdraw-api.js <username>');
  console.log('Ví dụ: node call-withdraw-api.js john_doe');
  process.exit(1);
}

callWithdrawAPI(username); 