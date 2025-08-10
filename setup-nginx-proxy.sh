#!/bin/bash

echo "Cài đặt Nginx proxy cho Supabase..."

# Cài đặt Nginx nếu chưa có
if ! command -v nginx &> /dev/null; then
    echo "Cài đặt Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Tạo SSL certificate tự ký
echo "Tạo SSL certificate tự ký..."
sudo mkdir -p /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/ssl-cert-snakeoil.key \
    -out /etc/ssl/certs/ssl-cert-snakeoil.pem \
    -subj "/C=VN/ST=Hanoi/L=Hanoi/O=Company/CN=206.206.126.141"

# Sao chép cấu hình Nginx
echo "Cấu hình Nginx..."
sudo cp nginx-supabase-proxy.conf /etc/nginx/sites-available/supabase-proxy
sudo ln -sf /etc/nginx/sites-available/supabase-proxy /etc/nginx/sites-enabled/

# Xóa cấu hình mặc định
sudo rm -f /etc/nginx/sites-enabled/default

# Kiểm tra cấu hình Nginx
echo "Kiểm tra cấu hình Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Khởi động lại Nginx..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo "Cấu hình hoàn tất!"
    echo "Supabase API giờ đây có thể truy cập qua HTTPS:"
    echo "https://206.206.126.141/rest/v1/"
    echo "https://206.206.126.141/auth/v1/"
    echo "https://206.206.126.141/functions/v1/"
else
    echo "Lỗi cấu hình Nginx!"
    exit 1
fi

