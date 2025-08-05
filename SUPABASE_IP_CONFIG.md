# Cấu hình Supabase với IP Server

## 📍 Thông tin Server
- **Server IP**: `api.dinamondbet68.com`
- **Supabase Local**: Đang chạy và hoạt động
- **Status**: ✅ Hoàn thành cấu hình

## 🔧 Cấu hình đã thiết lập

### 1. Supabase Config (`supabase/config.toml`)
```toml
[studio]
enabled = true
port = 54323
api_url = "https://api.dinamondbet68.com/"

[auth]
enabled = true
site_url = "https://api.dinamondbet68.com/"
additional_redirect_urls = ["https://api.dinamondbet68.com/"]
```

### 2. Environment Variables (`.env.local`)
```bash
# Sử dụng Local Supabase
VITE_USE_LOCAL_SUPABASE=true

# Local Supabase với IP server
VITE_LOCAL_SUPABASE_URL=https://api.dinamondbet68.com/
VITE_LOCAL_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 3. Client Configuration (`src/integrations/supabase/client.ts`)
- ✅ Đã cập nhật để sử dụng biến môi trường `VITE_USE_LOCAL_SUPABASE`
- ✅ Tự động chuyển đổi giữa Local và Cloud dựa trên cấu hình

## 🌐 URLs có thể truy cập

### Supabase Services
- **API URL**: https://api.dinamondbet68.com/
- **Studio URL**: https://api.dinamondbet68.com/
- **GraphQL URL**: https://api.dinamondbet68.com/graphql/v1
- **Storage URL**: https://api.dinamondbet68.com/storage/v1/s3

### Application
- **Dev Server**: https://api.dinamondbet68.com/
- **Alt Dev Server**: https://api.dinamondbet68.com/

## ✅ Kiểm tra kết nối

### Supabase API
```bash
curl -I https://api.dinamondbet68.com/rest/v1/
# Response: HTTP/1.1 200 OK
```

### Auth System
```bash
# Auth đang hoạt động bình thường
# Session management: ✅ Working
```

## 🚀 Cách sử dụng

### 1. Chuyển đổi giữa Local và Cloud
```bash
# Sử dụng Local Supabase
VITE_USE_LOCAL_SUPABASE=true

# Sử dụng Cloud Supabase  
VITE_USE_LOCAL_SUPABASE=false
```

### 2. Khởi động Supabase Local
```bash
supabase start
```

### 3. Kiểm tra trạng thái
```bash
supabase status
```

## 📝 Lưu ý quan trọng

1. **IP Server**: `api.dinamondbet68.com` đã được cấu hình đúng trong tất cả các file
2. **Ports**: 
   - Supabase API: 54321
   - Supabase Studio: 54323
   - Vite Dev Server: 8080/8081
3. **Security**: Tất cả các endpoints đều có thể truy cập từ IP bên ngoài
4. **Fallback**: Hệ thống có fallback sang Cloud Supabase nếu Local không khả dụng

## 🔄 Cập nhật gần đây

- ✅ Cập nhật client.ts để sử dụng biến môi trường
- ✅ Kiểm tra kết nối API thành công
- ✅ Xác nhận auth system hoạt động
- ✅ Cấu hình Vite để truy cập từ IP bên ngoài

---

**Trạng thái**: 🟢 Hoàn thành - Supabase đang chạy với IP server `api.dinamondbet68.com` 