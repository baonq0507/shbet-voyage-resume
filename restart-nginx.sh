#!/bin/bash

echo "🔄 Khởi động lại Nginx với cấu hình mới..."

# Kiểm tra cú pháp cấu hình
echo "🔍 Kiểm tra cú pháp cấu hình Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Cấu hình Nginx hợp lệ"
    
    # Reload Nginx
    echo "🔄 Reload Nginx..."
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx đã được reload thành công"
        echo "🌐 Domain dinamondbet68.com giờ đây có thể truy cập được"
    else
        echo "❌ Không thể reload Nginx"
        echo "🔄 Thử restart Nginx..."
        systemctl restart nginx
    fi
else
    echo "❌ Cấu hình Nginx có lỗi"
    echo "🔍 Kiểm tra file cấu hình..."
    cat nginx-supabase-proxy.conf
fi

echo "📊 Kiểm tra trạng thái Nginx..."
systemctl status nginx --no-pager -l

echo "🌐 Kiểm tra domain có thể truy cập được không..."
curl -I https://dinamondbet68.com/functions/v1/get-games-list
