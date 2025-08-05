#!/bin/bash

# Script để chuyển đổi giữa Local và Cloud Supabase
# Usage: ./switch-env.sh [local|cloud]

ENV_FILE=".env.local"

# Kiểm tra file .env.local có tồn tại không
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File $ENV_FILE không tồn tại!"
    echo "📝 Tạo file $ENV_FILE từ template..."
    cp env-template.local .env.local
fi

# Hàm chuyển sang Local
switch_to_local() {
    echo "🔄 Chuyển sang Supabase LOCAL..."
    sed -i 's/VITE_USE_LOCAL_SUPABASE=false/VITE_USE_LOCAL_SUPABASE=true/' $ENV_FILE
    sed -i 's/# VITE_USE_LOCAL_SUPABASE=true/VITE_USE_LOCAL_SUPABASE=true/' $ENV_FILE
    echo "✅ Đã chuyển sang LOCAL"
    echo "📊 Supabase Studio: https://api.dinamondbet68.com/"
echo "🔗 API URL: https://api.dinamondbet68.com/"
    echo "💡 Chạy: ./start-local.sh để khởi động local"
}

# Hàm chuyển sang Cloud
switch_to_cloud() {
    echo "🔄 Chuyển sang Supabase CLOUD..."
    sed -i 's/VITE_USE_LOCAL_SUPABASE=true/VITE_USE_LOCAL_SUPABASE=false/' $ENV_FILE
    sed -i 's/# VITE_USE_LOCAL_SUPABASE=false/VITE_USE_LOCAL_SUPABASE=false/' $ENV_FILE
    echo "✅ Đã chuyển sang CLOUD"
    echo "🌐 Supabase URL: https://hlydtwqhiuwbikkjemck.supabase.co"
    echo "💡 Chạy: npm run dev để khởi động app"
}

# Hàm hiển thị trạng thái hiện tại
show_status() {
    if grep -q "VITE_USE_LOCAL_SUPABASE=true" $ENV_FILE; then
        echo "📍 Hiện tại: LOCAL"
        echo "📊 Supabase Studio: https://api.dinamondbet68.com/"
    else
        echo "📍 Hiện tại: CLOUD"
        echo "🌐 Supabase URL: https://hlydtwqhiuwbikkjemck.supabase.co"
    fi
}

# Xử lý tham số
case "${1:-}" in
    "local"|"l")
        switch_to_local
        ;;
    "cloud"|"c")
        switch_to_cloud
        ;;
    "status"|"s")
        show_status
        ;;
    *)
        echo "🔄 Supabase Environment Switcher"
        echo ""
        echo "Usage:"
        echo "  ./switch-env.sh local    - Chuyển sang LOCAL"
        echo "  ./switch-env.sh cloud    - Chuyển sang CLOUD"
        echo "  ./switch-env.sh status   - Hiển thị trạng thái hiện tại"
        echo ""
        show_status
        ;;
esac 