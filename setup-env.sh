#!/bin/bash

echo "=== Thiết lập biến môi trường cho Supabase Edge Functions ==="

# Kiểm tra xem có đang chạy Supabase local không
if ! pgrep -f "supabase" > /dev/null; then
    echo "❌ Supabase local không đang chạy. Hãy chạy 'supabase start' trước."
    exit 1
fi

# Thiết lập các biến môi trường cho PayOS
echo "🔑 Thiết lập biến môi trường PayOS..."

# Đọc từ file env.example nếu có
if [ -f "env.example" ]; then
    echo "📖 Đọc cấu hình từ env.example..."
    source env.example
fi

# Thiết lập các biến môi trường
export PAYOS_CLIENT_ID=${PAYOS_CLIENT_ID:-"your_payos_client_id_here"}
export PAYOS_API_KEY=${PAYOS_API_KEY:-"your_payos_api_key_here"}
export PAYOS_CHECKSUM_KEY=${PAYOS_CHECKSUM_KEY:-"your_payos_checksum_key_here"}

export RECEIVER_BANK_CODE=${RECEIVER_BANK_CODE:-"your_bank_code_here"}
export RECEIVER_ACCOUNT_NUMBER=${RECEIVER_ACCOUNT_NUMBER:-"your_account_number_here"}
export RECEIVER_ACCOUNT_NAME=${RECEIVER_ACCOUNT_NAME:-"your_account_name_here"}

echo "✅ Biến môi trường đã được thiết lập:"
echo "   PAYOS_CLIENT_ID: ${PAYOS_CLIENT_ID}"
echo "   PAYOS_API_KEY: ${PAYOS_API_KEY:0:10}..."
echo "   PAYOS_CHECKSUM_KEY: ${PAYOS_CHECKSUM_KEY:0:10}..."
echo "   RECEIVER_BANK_CODE: ${RECEIVER_BANK_CODE}"
echo "   RECEIVER_ACCOUNT_NUMBER: ${RECEIVER_ACCOUNT_NUMBER}"
echo "   RECEIVER_ACCOUNT_NAME: ${RECEIVER_ACCOUNT_NAME}"

echo ""
echo "📝 Để thiết lập vĩnh viễn, hãy:"
echo "1. Chỉnh sửa file env.example với thông tin thực tế"
echo "2. Chạy lại script này: ./setup-env.sh"
echo "3. Hoặc thiết lập qua Supabase CLI: supabase secrets set PAYOS_CLIENT_ID=your_value"
echo ""
echo "🚀 Bây giờ bạn có thể chạy Edge Functions với:"
echo "   supabase functions serve create-deposit-order --env-file env.example"
