#!/bin/bash

FUNCTION_NAME=${1:-"create-deposit-order"}
ENV_FILE=${2:-"env.example"}

echo "=== Chạy Supabase Edge Function: $FUNCTION_NAME ==="

# Kiểm tra xem Supabase có đang chạy không
if ! pgrep -f "supabase" > /dev/null; then
    echo "❌ Supabase local không đang chạy."
    echo "🚀 Hãy chạy 'supabase start' trước."
    exit 1
fi

# Kiểm tra xem function có tồn tại không
if [ ! -d "supabase/functions/$FUNCTION_NAME" ]; then
    echo "❌ Function '$FUNCTION_NAME' không tồn tại."
    echo "📁 Các function có sẵn:"
    ls supabase/functions/
    exit 1
fi

# Kiểm tra file env
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File env '$ENV_FILE' không tồn tại."
    echo "📝 Hãy tạo file env.example trước."
    exit 1
fi

echo "✅ Supabase đang chạy"
echo "✅ Function '$FUNCTION_NAME' tồn tại"
echo "✅ File env '$ENV_FILE' tồn tại"

echo ""
echo "🔑 Thiết lập biến môi trường từ $ENV_FILE..."
source "$ENV_FILE"

echo ""
echo "🚀 Khởi chạy Edge Function..."
echo "📝 Lệnh: supabase functions serve $FUNCTION_NAME --env-file $ENV_FILE"
echo ""

# Chạy Edge Function
supabase functions serve "$FUNCTION_NAME" --env-file "$ENV_FILE"
