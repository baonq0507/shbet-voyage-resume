# Hướng dẫn thiết lập biến môi trường cho Supabase Edge Functions

## Vấn đề
Supabase Edge Functions không thể đọc trực tiếp từ file `.env` thông thường. Thay vào đó, bạn cần thiết lập biến môi trường thông qua các cách khác.

## Giải pháp

### Cách 1: Sử dụng file env.example và script setup-env.sh (Khuyến nghị cho development)

1. **Chỉnh sửa file `env.example`:**
   ```bash
   # Thay thế các giá trị mẫu bằng thông tin thực tế
   PAYOS_CLIENT_ID=your_actual_client_id
   PAYOS_API_KEY=your_actual_api_key
   PAYOS_CHECKSUM_KEY=your_actual_checksum_key
   
   RECEIVER_BANK_CODE=VCB
   RECEIVER_ACCOUNT_NUMBER=1234567890
   RECEIVER_ACCOUNT_NAME=NGUYEN VAN A
   ```

2. **Chạy script thiết lập:**
   ```bash
   ./setup-env.sh
   ```

3. **Chạy Edge Function với biến môi trường:**
   ```bash
   supabase functions serve create-deposit-order --env-file env.example
   ```

### Cách 2: Sử dụng Supabase CLI secrets (Khuyến nghị cho production)

1. **Đăng nhập vào Supabase:**
   ```bash
   supabase login
   ```

2. **Thiết lập secrets:**
   ```bash
   supabase secrets set PAYOS_CLIENT_ID=your_actual_client_id
   supabase secrets set PAYOS_API_KEY=your_actual_api_key
   supabase secrets set PAYOS_CHECKSUM_KEY=your_actual_checksum_key
   supabase secrets set RECEIVER_BANK_CODE=VCB
   supabase secrets set RECEIVER_ACCOUNT_NUMBER=1234567890
   supabase secrets set RECEIVER_ACCOUNT_NAME="NGUYEN VAN A"
   ```

3. **Xem danh sách secrets:**
   ```bash
   supabase secrets list
   ```

### Cách 3: Thiết lập trực tiếp trong code (Chỉ dành cho testing)

Bạn có thể chỉnh sửa trực tiếp trong file `index.ts`:

```typescript
// Thay vì:
const clientId = Deno.env.get("PAYOS_CLIENT_ID");

// Sử dụng:
const clientId = "your_actual_client_id";
```

**⚠️ Cảnh báo:** Không bao giờ commit thông tin nhạy cảm vào code!

## Các biến môi trường cần thiết

### PayOS Configuration
- `PAYOS_CLIENT_ID`: Client ID từ PayOS dashboard
- `PAYOS_API_KEY`: API Key từ PayOS dashboard  
- `PAYOS_CHECKSUM_KEY`: Checksum key để tạo chữ ký

### Bank Configuration (Fallback VietQR)
- `RECEIVER_BANK_CODE`: Mã ngân hàng (VD: VCB, TCB, BIDV)
- `RECEIVER_ACCOUNT_NUMBER`: Số tài khoản ngân hàng
- `RECEIVER_ACCOUNT_NAME`: Tên chủ tài khoản

### Supabase Configuration (Tự động thiết lập)
- `SUPABASE_URL`: URL của Supabase project
- `SUPABASE_ANON_KEY`: Anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key

## Kiểm tra biến môi trường

Trong Edge Function, bạn có thể kiểm tra xem biến môi trường có được thiết lập đúng không:

```typescript
console.log("PayOS config check:", {
  hasClientId: !!Deno.env.get("PAYOS_CLIENT_ID"),
  hasApiKey: !!Deno.env.get("PAYOS_API_KEY"),
  hasChecksumKey: !!Deno.env.get("PAYOS_CHECKSUM_KEY"),
  clientIdLength: Deno.env.get("PAYOS_CLIENT_ID")?.length || 0,
  apiKeyLength: Deno.env.get("PAYOS_API_KEY")?.length || 0
});
```

## Troubleshooting

### Lỗi "Missing environment variables"
- Kiểm tra xem biến môi trường có được thiết lập đúng không
- Đảm bảo đã chạy `supabase start` trước khi chạy Edge Functions
- Kiểm tra log để xem biến nào bị thiếu

### Lỗi "Access token not provided"
- Chạy `supabase login` để đăng nhập
- Hoặc thiết lập `SUPABASE_ACCESS_TOKEN` environment variable

### Lỗi "Function not found"
- Đảm bảo đã chạy `supabase functions serve` với đúng tên function
- Kiểm tra xem function có tồn tại trong thư mục `supabase/functions/` không

## Lưu ý bảo mật

1. **Không bao giờ commit file `.env` hoặc `env.example` chứa thông tin thực**
2. **Sử dụng Supabase secrets cho production**
3. **Rotate API keys định kỳ**
4. **Giới hạn quyền truy cập vào Edge Functions**
5. **Log và monitor các hoạt động bất thường**
