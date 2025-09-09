#!/bin/bash

echo "🚀 Khởi động Supabase Local..."

# Kiểm tra xem Supabase CLI đã được cài đặt chưa
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI chưa được cài đặt"
    echo "📥 Cài đặt Supabase CLI:"
    echo "npm install -g supabase"
    echo "hoặc"
    echo "brew install supabase/tap/supabase"
    exit 1
fi

# Dừng Supabase nếu đang chạy
echo "🛑 Dừng Supabase nếu đang chạy..."
supabase stop

# Khởi động Supabase
echo "▶️ Khởi động Supabase..."
supabase start

# Kiểm tra status
echo "📊 Kiểm tra trạng thái Supabase..."
supabase status

echo ""
echo "✅ Supabase Local đã được khởi động!"
echo "🌐 API URL: http://127.0.0.1:54321"
echo "🗄️ Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo "🎨 Studio URL: http://127.0.0.1:54323"
echo ""
echo "🔑 Để lấy service role key, mở Studio và vào Settings > API"
echo "📝 Hoặc chạy: supabase status"
