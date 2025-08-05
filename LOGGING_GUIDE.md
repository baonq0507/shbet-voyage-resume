# Hướng Dẫn Đọc Log Backend

## Tổng Quan

File `supabase/functions/get-games-list/index.ts` đã được cải thiện với hệ thống logging chi tiết để dễ dàng debug và theo dõi hoạt động của API.

### Tính Năng Mới: Dynamic GPID
- GPID có thể được truyền từ frontend thông qua query params hoặc request body
- Mỗi tab có thể có GPID riêng để lấy games từ provider khác nhau
- Fallback về GPID mặc định nếu không được cung cấp

## Cách Đọc Log

### 1. Cấu Trúc Log

Mỗi log entry có format:
```
[requestId] emoji Mô tả: thông tin
```

Ví dụ:
```
[abc123] 🚀 Starting fetchGamesFromAPI - Category: all, GPID: 5
```

### 2. Các Loại Log

#### 🌐 Request Logs
- **Bắt đầu request**: `🌐 New request received`
- **CORS preflight**: `🔄 CORS preflight request handled`
- **Request parameters**: `📥 GET/POST request params/body`

#### 🚀 API Call Logs
- **Bắt đầu API call**: `🚀 Starting fetchGamesFromAPI`
- **Request payload**: `📤 Request payload`
- **Response status**: `📥 Response status`
- **Response headers**: `📥 Response headers`
- **Raw response**: `📊 Raw API response`

#### 🎮 Data Processing Logs
- **Total games**: `📋 Total games from API`
- **Skipped games**: `⏭️ Skipping disabled/maintenance game`
- **Transformed games**: `🎮 Transformed game`

#### ✅ Success Logs
- **API success**: `✅ Successfully fetched X games in Yms`
- **Performance**: `📈 Performance: Yms total, X games processed`
- **Request completion**: `✅ Request completed successfully`

#### ❌ Error Logs
- **API errors**: `❌ API request failed`
- **Data format errors**: `❌ Invalid data format`
- **General errors**: `❌ Error fetching games from API`

#### 🛟 Fallback Logs
- **Using fallback**: `🛟 Using fallback data`
- **Ultimate fallback**: `🛟 Using ultimate fallback data`

### 3. Cách Theo Dõi Request

Mỗi request có một `requestId` duy nhất để dễ dàng theo dõi:

```bash
# Tìm tất cả log của một request cụ thể
grep "abc123" logs.txt

# Hoặc filter theo requestId
tail -f logs.txt | grep "abc123"
```

### 4. Cách Debug Các Vấn Đề Thường Gặp

#### API Timeout
```
[abc123] ❌ Error fetching games from API after 5000ms: FetchError: timeout
```

**Giải pháp**: Kiểm tra network connection và API endpoint

#### API Error Response
```
[abc123] ❌ API returned error - ID: 1001, Message: Invalid credentials
```

**Giải pháp**: Kiểm tra `CompanyKey`, `ServerId`, `Gpid` trong config

#### Data Format Error
```
[abc123] ❌ Invalid data format - seamlessGameProviderGames is not an array
```

**Giải pháp**: API trả về data không đúng format, cần kiểm tra API response

#### Performance Issues
```
[abc123] 📈 Performance: 8000ms total, 150 games processed
```

**Giải pháp**: API response chậm, cần optimize hoặc cache

### 5. Cách Sử Dụng GPID

#### GET Request
```bash
# Với GPID cụ thể
curl "https://your-project.supabase.co/functions/v1/get-games-list?category=slots&gpid=10"

# Không có GPID (sử dụng default)
curl "https://your-project.supabase.co/functions/v1/get-games-list?category=slots"
```

#### POST Request
```json
{
  "category": "live-casino",
  "gpid": 15
}
```

#### GPID Mặc Định
- Nếu không truyền `gpid`, hệ thống sẽ sử dụng `API_CONFIG.gpid` (hiện tại là 5)
- Mỗi tab có thể có GPID riêng để lấy games từ provider khác nhau

### 6. Cách Xem Log Trong Supabase

#### Local Development
```bash
# Chạy function locally
supabase functions serve get-games-list

# Logs sẽ hiển thị trong terminal
```

#### Production
```bash
# Xem logs trong Supabase Dashboard
supabase functions logs get-games-list

# Hoặc real-time logs
supabase functions logs get-games-list --follow
```

### 7. Monitoring và Alerting

#### Performance Monitoring
- Theo dõi thời gian response > 5 giây
- Số lượng games processed < 10
- Tỷ lệ fallback usage > 20%

#### Error Monitoring
- API error rate > 5%
- Data format errors
- Network timeout errors

### 8. Best Practices

1. **Luôn sử dụng requestId** để track request
2. **Log đầy đủ context** khi có error
3. **Đo performance** cho mọi operation
4. **Structured logging** với JSON format
5. **Log levels** phù hợp (debug, info, warn, error)

### 9. Ví Dụ Log Flow Hoàn Chỉnh

#### GET Request với GPID
```
[abc123] 🌐 New request received - Method: GET, URL: /get-games-list?category=slots&gpid=10
[abc123] 📥 GET request params: { category: 'slots', gpid: '10' }
[abc123] 🎯 Processing request for category: slots, GPID: 10
[abc123] 🚀 Starting fetchGamesFromAPI - Category: slots, GPID: 10
[abc123] 📡 API URL: https://ex-api-yy5.tw946.com/web-root/restricted/information/get-game-list.aspx
[abc123] 📤 Request payload: { "CompanyKey": "...", "ServerId": "...", "Gpid": 10 }
[abc123] 📥 Response status: 200 OK
[abc123] 📊 Raw API response: { "seamlessGameProviderGames": [...], "error": { "id": 0 } }
[abc123] 📋 Total games from API: 150
[abc123] ⏭️ Skipping disabled/maintenance game: 12345 (enabled: false, maintain: false)
[abc123] 🎮 Transformed game: Sweet Bonanza (ID: 10_67890, Type: Slot)
[abc123] ✅ Successfully fetched 120 games in 1500ms
[abc123] 📊 Final games result: [...]
[abc123] ✅ Request completed successfully in 1600ms - Returning 120 games
```

#### POST Request với GPID
```
[abc123] 🌐 New request received - Method: POST, URL: /get-games-list
[abc123] 📥 POST request body: { "category": "live-casino", "gpid": 15 }
[abc123] 🎯 Processing request for category: live-casino, GPID: 15
[abc123] 🚀 Starting fetchGamesFromAPI - Category: live-casino, GPID: 15
[abc123] 📡 API URL: https://ex-api-yy5.tw946.com/web-root/restricted/information/get-game-list.aspx
[abc123] 📤 Request payload: { "CompanyKey": "...", "ServerId": "...", "Gpid": 15 }
[abc123] 📥 Response status: 200 OK
[abc123] 📊 Raw API response: { "seamlessGameProviderGames": [...], "error": { "id": 0 } }
[abc123] 📋 Total games from API: 80
[abc123] 🎮 Transformed game: Live Baccarat VIP (ID: 15_12345, Type: Baccarat)
[abc123] ✅ Successfully fetched 75 games in 1200ms
[abc123] 📊 Final games result: [...]
[abc123] ✅ Request completed successfully in 1300ms - Returning 75 games
```

### 10. Troubleshooting Checklist

- [ ] Kiểm tra network connection
- [ ] Verify API credentials
- [ ] Check API endpoint availability
- [ ] Validate request payload
- [ ] Review response format
- [ ] Monitor performance metrics
- [ ] Check fallback data usage 