# 🚀 Giải quyết nhanh vấn đề biến môi trường

## ❌ Vấn đề
Không thể lấy thông tin từ file `.env` trong Supabase Edge Functions

## ✅ Giải pháp nhanh

### Bước 1: Chỉnh sửa file env.example
```bash
# Mở file env.example và thay thế các giá trị mẫu
nano env.example

# Thay thế:
PAYOS_CLIENT_ID=your_actual_client_id
PAYOS_API_KEY=your_actual_api_key
PAYOS_CHECKSUM_KEY=your_actual_checksum_key
RECEIVER_BANK_CODE=VCB
RECEIVER_ACCOUNT_NUMBER=1234567890
RECEIVER_ACCOUNT_NAME="NGUYEN VAN A"
```

### Bước 2: Chạy Edge Function
```bash
# Cách 1: Sử dụng script có sẵn
./run-edge-function.sh create-deposit-order

# Cách 2: Chạy trực tiếp
supabase functions serve create-deposit-order --env-file env.example
```

## 🔧 Các script hữu ích

- `./setup-env.sh` - Thiết lập biến môi trường
- `./test-env.js` - Kiểm tra biến môi trường
- `./run-edge-function.sh` - Chạy Edge Function

## 📚 Tài liệu chi tiết
Xem file `EDGE_FUNCTIONS_ENV_SETUP.md` để biết thêm chi tiết.

## ⚠️ Lưu ý quan trọng
- **KHÔNG** commit file `.env` chứa thông tin thực
- Sử dụng `env.example` cho development
- Sử dụng `supabase secrets` cho production
