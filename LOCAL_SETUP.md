# Hướng dẫn sử dụng Supabase Local

## Tại sao chuyển sang Local?

Hiện tại ứng dụng đang sử dụng:
- **Supabase Cloud**: `https://hlydtwqhiuwbikkjemck.supabase.co`
- **External Game API**: `https://ex-api-yy5.tw946.com/...`

## Cách chuyển sang Local Database

### 1. Cài đặt Supabase CLI

```bash
npm install -g supabase
```

### 2. Khởi động Supabase Local

```bash
# Cách 1: Sử dụng script tự động
./start-local.sh

# Cách 2: Thủ công
supabase start
```

### 3. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc:

```env
# Sử dụng Supabase Local
VITE_USE_LOCAL_SUPABASE=true

# Local Supabase URLs
VITE_LOCAL_SUPABASE_URL=http://206.206.126.141:54321
VITE_LOCAL_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Cloud Supabase URLs (fallback)
VITE_CLOUD_SUPABASE_URL=https://hlydtwqhiuwbikkjemck.supabase.co
VITE_CLOUD_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseWR0d3FoaXV3Ymlra2plbWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTA1MjQsImV4cCI6MjA2OTgyNjUyNH0.deIb21DJNmyM5ZjocFAl4j_47AF6CnY26LN0Bn9eB9k
```

### 4. Khởi động ứng dụng

```bash
npm run dev
```

## URLs khi chạy Local

- **React App**: http://206.206.126.141:8080
- **Supabase Studio**: http://206.206.126.141:54323
- **API URL**: http://206.206.126.141:54321
- **Database**: postgresql://postgres:postgres@206.206.126.141:54322/postgres

## Lợi ích của Local Development

### ✅ **Ưu điểm:**
- **Tốc độ nhanh**: Không cần internet, latency thấp
- **Bảo mật**: Dữ liệu chỉ ở máy local
- **Kiểm soát**: Có thể reset database dễ dàng
- **Offline**: Làm việc không cần internet
- **Debug**: Dễ dàng debug và test

### ⚠️ **Lưu ý:**
- **Game API**: Vẫn call external API (không thể local)
- **Setup**: Cần cài đặt Supabase CLI
- **Storage**: Dữ liệu sẽ mất khi restart Supabase local

## Chuyển đổi giữa Local và Cloud

### Sử dụng Local:
```env
VITE_USE_LOCAL_SUPABASE=true
```

### Sử dụng Cloud:
```env
VITE_USE_LOCAL_SUPABASE=false
# hoặc xóa dòng này
```

## Troubleshooting

### Lỗi "Supabase CLI not found"
```bash
npm install -g supabase
```

### Lỗi "Port already in use"
```bash
# Dừng Supabase local
supabase stop

# Khởi động lại
supabase start
```

### Lỗi "Database connection failed"
```bash
# Reset database local
supabase db reset

# Hoặc khởi động lại hoàn toàn
supabase stop
supabase start
```

## Migration từ Cloud sang Local

Nếu muốn copy dữ liệu từ cloud sang local:

```bash
# Pull schema từ cloud
supabase db pull

# Pull data (nếu cần)
supabase db dump --data-only > data.sql
supabase db reset
psql postgresql://postgres:postgres@206.206.126.141:54322/postgres < data.sql
```