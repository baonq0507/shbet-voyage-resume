# Get Games List Function

## Cấu hình

Để khắc phục lỗi "unexpected_failure" từ API xác thực, bạn cần cập nhật các thông tin sau trong file `index.ts`:

### 1. Cập nhật Service Role Key

Thay thế dòng này:
```typescript
const supabaseServiceKey = 'YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE';
```

Với key thực của bạn từ Supabase Dashboard:
```typescript
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 2. Cập nhật URL (nếu cần)

Nếu URL của bạn khác, hãy cập nhật:
```typescript
const supabaseUrl = 'https://your-actual-domain.com/';
```

## Cách lấy Service Role Key

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** > **API**
4. Copy **service_role** key (không phải anon key)

## Khắc phục lỗi thường gặp

### Lỗi "unexpected_failure"
- Kiểm tra Service Role Key có đúng không
- Kiểm tra URL Supabase có chính xác không
- Kiểm tra quyền truy cập database
- Kiểm tra logs trong Supabase Dashboard

### Lỗi xác thực
- Đảm bảo sử dụng service_role key, không phải anon key
- Kiểm tra RLS policies trong database
- Kiểm tra bảng `games` có tồn tại không

## Test kết nối

Function sẽ tự động test kết nối trước khi thực hiện query. Nếu kết nối thất bại, nó sẽ sử dụng fallback data.

## Fallback Data

Khi database không khả dụng, function sẽ trả về dữ liệu mẫu cho các danh mục:
- Casino games
- Slot games  
- Sports betting
- Card games
- Fishing games
- Cockfight games
- Lottery games
