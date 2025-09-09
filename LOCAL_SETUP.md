# 🏠 Hướng dẫn sử dụng Supabase Local

## 📋 Tổng quan
Dự án này đã được cấu hình để sử dụng Supabase Local thay vì Supabase Cloud.

## 🚀 Khởi động nhanh

### 1. Cài đặt Supabase CLI
```bash
# Sử dụng npm
npm install -g supabase

# Hoặc sử dụng Homebrew (macOS)
brew install supabase/tap/supabase
```

### 2. Khởi động Supabase Local
```bash
# Chạy script tự động
chmod +x start-local.sh
./start-local.sh

# Hoặc chạy thủ công
supabase start
```

### 3. Kiểm tra trạng thái
```bash
supabase status
```

## 🔧 Cấu hình

### URLs Local
- **API URL**: `http://127.0.0.1:54321`
- **Database URL**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Studio URL**: `http://127.0.0.1:54323`
- **Inbucket URL**: `http://127.0.0.1:54324`

### Keys
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`
- **Service Role Key**: Lấy từ `supabase status` hoặc Studio

## 📱 Sử dụng

### 1. Mở Supabase Studio
Truy cập: http://127.0.0.1:54323

### 2. Quản lý Database
- Tạo bảng mới
- Chạy SQL queries
- Xem dữ liệu

### 3. Quản lý Functions
- Deploy functions
- Xem logs
- Test endpoints

## 🧪 Test API

### Test kết nối
```bash
curl "http://127.0.0.1:54321/functions/v1/get-games-list/test"
```

### Test games list
```bash
curl "http://127.0.0.1:54321/functions/v1/get-games-list?category=all"
```

## 🛠️ Troubleshooting

### Port bị chiếm
```bash
# Dừng Supabase
supabase stop

# Khởi động với port khác
supabase start --api-port 54325 --db-port 54326
```

### Function không deploy
```bash
# Deploy function cụ thể
supabase functions deploy get-games-list

# Deploy tất cả
supabase functions deploy
```

### Database lỗi
```bash
# Reset database
supabase db reset

# Chạy migration
supabase migration up
```

## 📁 Files đã thay đổi

Các file sau đã được cập nhật để sử dụng local:
- `src/integrations/supabase/client.ts`
- `src/components/TransactionModal.tsx`
- `fetch-games-by-category.js`
- `test-realtime.html`
- `supabase/config.toml`

## 🔄 Quay lại Production

Nếu muốn quay lại sử dụng Supabase Cloud:
1. Thay đổi URL về: `https://hlydtwqhiuwbikkjemck.supabase.co`
2. Sử dụng keys production
3. Cập nhật `project_id` trong `supabase/config.toml`

## 📞 Hỗ trợ

- Xem logs: `supabase logs`
- Kiểm tra status: `supabase status`
- Tài liệu: https://supabase.com/docs/guides/cli
