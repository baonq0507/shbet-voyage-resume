# 🔧 Cấu hình Supabase Local - Khắc phục lỗi "unexpected_failure"

## ⚠️ VẤN ĐỀ HIỆN TẠI
Bạn đang gặp lỗi "unexpected_failure" từ API xác thực Supabase Local.

## 🏠 GIẢI PHÁP CHO SUPABASE LOCAL

### Bước 1: Khởi động Supabase Local
```bash
# Trong thư mục project
supabase start

# Kiểm tra status
supabase status
```

### Bước 2: Lấy Service Role Key từ Local
Sau khi `supabase start`, bạn sẽ thấy output như:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅
```

**Copy service_role key** (không phải anon key!)

### Bước 3: Cập nhật cấu hình trong code
Mở file `supabase/functions/get-games-list/index.ts` và cập nhật:

```typescript
// Cập nhật URL cho local
const supabaseUrl = 'http://127.0.0.1:54321';

// Thay thế service_role key
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // key từ local
```

### Bước 4: Kiểm tra Local Studio
Mở browser, truy cập: `http://127.0.0.1:54323`
- Vào **Settings** → **API**
- Copy **service_role** key

## 🧪 TEST KẾT NỐI LOCAL

### Chạy script test (đã cập nhật):
```bash
node test-connection.js
```

### Test endpoint trực tiếp:
```bash
# Test endpoint test
curl "http://127.0.0.1:54321/functions/v1/get-games-list/test"

# Test endpoint games
curl "http://127.0.0.1:54321/functions/v1/get-games-list?category=all"
```

### Test từ Local Studio:
1. Mở `http://127.0.0.1:54323`
2. Vào **Functions**
3. Test function `get-games-list`

## 🔧 KHẮC PHỤC SỰ CỐ LOCAL

### Nếu port bị chiếm:
```bash
# Dừng Supabase
supabase stop

# Khởi động với port khác
supabase start --api-port 54325 --db-port 54326

# Cập nhật URL trong code
const supabaseUrl = 'http://127.0.0.1:54325';
```

### Nếu function không deploy:
```bash
# Deploy function
supabase functions deploy get-games-list

# Hoặc deploy tất cả
supabase functions deploy
```

### Nếu database không có bảng games:
```bash
# Tạo migration
supabase migration new create_games_table

# Chạy migration
supabase db reset
```

## 📊 KẾT QUẢ MONG ĐỢI

Sau khi cấu hình đúng:
- ✅ Endpoint test: `http://127.0.0.1:54321/functions/v1/get-games-list/test`
- ✅ Endpoint games: `http://127.0.0.1:54321/functions/v1/get-games-list`
- ✅ Không còn lỗi "unexpected_failure"
- ✅ Kết nối database local thành công

## 🆘 NẾU VẪN LỖI

1. **Kiểm tra logs**: `supabase logs`
2. **Kiểm tra status**: `supabase status`
3. **Restart**: `supabase stop && supabase start`
4. **Kiểm tra port**: `netstat -tulpn | grep 54321`
5. **Kiểm tra firewall**: Đảm bảo localhost không bị chặn

## 📞 HỖ TRỢ

- Xem file `README.md` trong thư mục function
- Chạy script test: `node test-connection.js`
- Kiểm tra logs: `supabase logs`
- Tài liệu Local: https://supabase.com/docs/guides/cli
