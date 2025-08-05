# Hệ Thống Database Games

Hệ thống này cho phép bạn call API để lấy danh sách game từ nhiều GPID khác nhau và lưu vào database Supabase.

## Cấu Trúc Database

### Bảng `games`
Bảng chính để lưu trữ thông tin game với các trường:

- `id`: UUID primary key
- `game_id`: ID game từ API (unique với gpid)
- `name`: Tên game
- `image`: URL hình ảnh game
- `type`: Loại game (Baccarat, Roulette, etc.)
- `category`: Danh mục game
- `is_active`: Trạng thái hoạt động
- `provider`: Nhà cung cấp game
- `rank`: Thứ tự hiển thị
- `gpid`: Game Provider ID (quan trọng để phân biệt nguồn)
- `game_provider_id`: ID nhà cung cấp từ API
- `game_type`: Loại game từ API
- `new_game_type`: Loại game mới từ API
- `rtp`: Tỷ lệ hoàn trả
- `rows`, `reels`, `lines`: Thông số slot game
- `is_maintain`: Trạng thái bảo trì
- `is_enabled`: Trạng thái kích hoạt
- `is_provider_online`: Trạng thái online của provider
- `supported_currencies`: Danh sách tiền tệ hỗ trợ
- `block_countries`: Danh sách quốc gia bị chặn
- `created_at`, `updated_at`: Timestamp

## Các Function Supabase

### 1. `sync-games-database`
Function để call API và lưu game vào database.

**Endpoint:** `POST /functions/v1/sync-games-database`

**Parameters:**
```json
{
  "gpids": [1, 5, 6, 10, 11, 20, 28, 33, 38, 1019, 1021, 1022, 1024],
  "category": "casino"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "casino",
    "gpids": [1, 5, 6, 10, 11, 20, 28, 33, 38, 1019, 1021, 1022, 1024],
    "totalGames": 150,
    "successCount": 145,
    "errorCount": 5,
    "results": [
      {
        "gpid": 1,
        "gamesCount": 25,
        "success": true
      }
    ]
  }
}
```

### 2. `get-games-from-database`
Function để lấy danh sách game từ database với filter.

**Endpoint:** `GET /functions/v1/get-games-from-database`

**Query Parameters:**
- `category`: Lọc theo danh mục
- `type`: Lọc theo loại game
- `provider`: Lọc theo nhà cung cấp
- `gpid`: Lọc theo GPID
- `is_active`: Lọc theo trạng thái hoạt động
- `search`: Tìm kiếm theo tên, loại, danh mục
- `limit`: Số lượng kết quả (default: 50)
- `offset`: Vị trí bắt đầu (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "games": [...],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "offset": 0,
      "total": 150,
      "totalPages": 3
    },
    "filters": {
      "applied": {...},
      "available": {
        "categories": ["Baccarat", "Roulette", "Slot"],
        "types": ["Baccarat", "Roulette", "Slot"],
        "providers": ["BigGaming", "Pragmatic"],
        "gpids": [1, 5, 6, 10, 11, 20, 28, 33, 38, 1019, 1021, 1022, 1024]
      }
    }
  }
}
```

## Danh Sách GPID Casino

Hiện tại hệ thống hỗ trợ các GPID casino sau:
- 1, 5, 6, 10, 11, 20, 28, 33, 38, 1019, 1021, 1022, 1024

## Cách Sử Dụng

### 1. Chạy Migration
```bash
supabase db push
```

### 2. Sync Games từ API
```bash
# Sync tất cả GPID casino
curl -X POST "https://your-project.supabase.co/functions/v1/sync-games-database" \
  -H "Content-Type: application/json" \
  -d '{"category": "casino"}'

# Sync GPID cụ thể
curl -X POST "https://your-project.supabase.co/functions/v1/sync-games-database" \
  -H "Content-Type: application/json" \
  -d '{"gpids": [1, 5, 6], "category": "casino"}'
```

### 3. Lấy Games từ Database
```bash
# Lấy tất cả games
curl "https://your-project.supabase.co/functions/v1/get-games-from-database"

# Lọc theo category
curl "https://your-project.supabase.co/functions/v1/get-games-from-database?category=Baccarat"

# Tìm kiếm
curl "https://your-project.supabase.co/functions/v1/get-games-from-database?search=baccarat"

# Phân trang
curl "https://your-project.supabase.co/functions/v1/get-games-from-database?limit=20&offset=40"
```

## Thêm GPID Mới

Để thêm GPID cho category khác, bạn có thể:

1. **Cập nhật function `sync-games-database`:**
   - Thêm danh sách GPID mới vào constant
   - Hoặc truyền GPID qua parameter

2. **Gọi API với GPID mới:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/sync-games-database" \
  -H "Content-Type: application/json" \
  -d '{"gpids": [1001, 1002, 1003], "category": "slots"}'
```

## Tính Năng Đặc Biệt

1. **Upsert Logic:** Hệ thống tự động cập nhật game nếu đã tồn tại (dựa trên game_id + gpid)
2. **Error Handling:** Xử lý lỗi API và database gracefully
3. **Rate Limiting:** Delay 1 giây giữa các request API
4. **Logging:** Log chi tiết cho debugging
5. **Filter Options:** Hỗ trợ nhiều loại filter và search
6. **Pagination:** Hỗ trợ phân trang kết quả

## Monitoring

Các function có logging chi tiết để monitor:
- Request ID cho tracking
- Thời gian xử lý
- Số lượng game processed
- Error details
- Performance metrics

## Lưu Ý

1. **API Rate Limiting:** Hệ thống có delay 1 giây giữa các request để tránh overwhelm API
2. **Database Performance:** Có index cho các trường thường query
3. **Data Consistency:** Sử dụng upsert để đảm bảo data consistency
4. **Security:** RLS policies được cấu hình cho security 