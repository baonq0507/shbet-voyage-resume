// Script để fetch games từ API cho category và GPIDs cụ thể, sử dụng cấu trúc category từ menuItems
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://206.206.126.141:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Cấu hình API
const API_CONFIG = {
  baseUrl: "https://ex-api-yy5.tw946.com/web-root/restricted/information/get-game-list.aspx",
  companyKey: "C6012BA39EB643FEA4F5CD49AF138B02",
  serverId: "206.206.126.141"
};

// Định nghĩa category dựa trên menuItems
const MENU_CATEGORY_CONFIGS = {
  casino: {
    name: 'CASINO',
    gpids: [5, 7, 19, 20, 28, 33, 38, 1019, 1021, 1024]
  },
  nohu: {
    name: 'NỔ HŨ',
    gpids: [2, 3, 13, 14, 16, 22, 29, 35, 1010, 1018, 1020]
  },
  banca: {
    name: 'BẮN CÁ',
    gpids: [1020, 1012]
  },
  thethao: {
    name: 'THỂ THAO',
    gpids: [44, 1015, 1022, 1053, 1070, 1080, 1086]
  },
  gamebai: {
    name: 'GAME BÀI',
    gpids: [10, 1011, 1013]
  },
  daga: {
    name: 'ĐÁ GÀ',
    gpids: [1001, 1002]
  },
  xoso: {
    name: 'XỔ SỐ',
    gpids: [1003]
  }
  // Các mục như vipclub, daily, thuonghieu, deposit không có GPID thực tế nên không đưa vào fetch
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchGamesFromAPI(gpid, category) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    console.log(`[${requestId}] 🚀 Bắt đầu fetchGamesFromAPI - GPID: ${gpid}, Category: ${category}`);
    const requestBody = {
      CompanyKey: API_CONFIG.companyKey,
      ServerId: API_CONFIG.serverId,
      Gpid: gpid
    };

    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] ❌ API request failed - Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`API request failed with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.error.id !== 0) {
      console.error(`[${requestId}] ❌ API trả về lỗi - ID: ${data.error.id}, Message: ${data.error.msg}`);
      throw new Error(data.error.msg || 'API returned error');
    }

    if (!data.seamlessGameProviderGames || !Array.isArray(data.seamlessGameProviderGames)) {
      throw new Error('Invalid data format from API');
    }

    const games = data.seamlessGameProviderGames
      .filter(game => game.isEnabled && !game.isMaintain)
      .map(game => {
        const gameInfo = game.gameInfos.find(info => info.language !== null) || game.gameInfos[0];
        return {
          game_id: `${game.gameProviderId}_${game.gameID}`,
          name: gameInfo?.gameName || `Game ${game.gameID}`,
          image: gameInfo?.gameIconUrl || "https://via.placeholder.com/300x200?text=No+Image",
          type: `Type ${game.newGameType}`,
          category: category,
          is_active: game.isEnabled && game.isProviderOnline,
          provider: game.provider,
          rank: game.rank,
          gpid: gpid,
          game_provider_id: game.gameProviderId,
          game_type: game.gameType,
          new_game_type: game.newGameType,
          rtp: game.rtp,
          rows: game.rows,
          reels: game.reels,
          lines: game.lines,
          is_maintain: game.isMaintain,
          is_enabled: game.isEnabled,
          is_provider_online: game.isProviderOnline,
          supported_currencies: game.supportedCurrencies || [],
          block_countries: game.blockCountries || []
        };
      })
      .sort((a, b) => a.rank - b.rank);

    const endTime = Date.now();
    console.log(`[${requestId}] ✅ fetchGamesFromAPI hoàn thành cho GPID ${gpid} trong ${endTime - startTime}ms - Tìm thấy ${games.length} game`);
    return games;
  } catch (error) {
    console.error(`[${requestId}] ❌ fetchGamesFromAPI thất bại cho GPID ${gpid}:`, error);
    throw error;
  }
}

async function saveGamesToDatabase(games) {
  if (games.length === 0) {
    console.log('📝 Không có game nào để lưu vào database');
    return;
  }
  try {
    const { data, error } = await supabase
      .from('games')
      .insert(games)
      .select();
    if (error) {
      console.error('❌ Lỗi khi lưu games vào database:', error);
      throw error;
    }
    console.log(`✅ Đã lưu thành công ${data.length} game vào database`);
    if (data.length > 0) {
      data.slice(0, 3).forEach(game => {
        console.log(`  - ${game.name} (GPID: ${game.gpid}, Category: ${game.category})`);
      });
    }
  } catch (error) {
    console.error('❌ Lưu games vào database thất bại:', error);
    throw error;
  }
}

async function processGPID(gpid, category) {
  const startTime = Date.now();
  console.log(`\n🎯 Đang xử lý GPID: ${gpid} cho category: ${category}`);
  try {
    const games = await fetchGamesFromAPI(gpid, category);
    if (games.length === 0) {
      console.log(`⚠️ Không tìm thấy game nào cho GPID ${gpid}`);
      return;
    }
    await saveGamesToDatabase(games);
    const endTime = Date.now();
    console.log(`✅ GPID ${gpid} xử lý thành công trong ${endTime - startTime}ms`);
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý GPID ${gpid}:`, error);
  }
}

async function fetchGamesByCategory(category, customGpids = null) {
  const startTime = Date.now();
  let categoryConfig;
  let gpids;

  if (customGpids) {
    categoryConfig = { name: category, gpids: customGpids };
    gpids = customGpids;
    console.log(`🎯 Sử dụng custom GPIDs cho category: ${category}`);
  } else if (MENU_CATEGORY_CONFIGS[category.toLowerCase()]) {
    categoryConfig = MENU_CATEGORY_CONFIGS[category.toLowerCase()];
    gpids = categoryConfig.gpids;
    console.log(`🎯 Sử dụng cấu hình menu cho category: ${categoryConfig.name}`);
  } else {
    throw new Error(`Không xác định được category: ${category}. Các category hợp lệ: ${Object.keys(MENU_CATEGORY_CONFIGS).join(', ')}`);
  }

  console.log(`🎰 Bắt đầu fetch games cho category: ${categoryConfig.name}`);
  console.log(`📋 Đang xử lý ${gpids.length} GPIDs:`, gpids);

  let successCount = 0;
  let errorCount = 0;
  let categoryGames = [];

  for (const gpid of gpids) {
    try {
      await processGPID(gpid, categoryConfig.name);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      errorCount++;
    }
  }

  const endTime = Date.now();
  const totalDuration = endTime - startTime;

  // Lấy thống kê cuối cùng từ database
  try {
    const { data, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' })
      .eq('category', categoryConfig.name);
    if (error) {
      console.error('❌ Lỗi lấy thống kê cuối:', error);
    } else {
      categoryGames = data;
      console.log(`📊 Tổng số game cho category "${categoryConfig.name}" trong database: ${data.length} (total: ${count})`);
      const gpidStats = {};
      data.forEach(game => {
        gpidStats[game.gpid] = (gpidStats[game.gpid] || 0) + 1;
      });
      console.log(`📊 Games theo GPID cho category "${categoryConfig.name}":`);
      Object.entries(gpidStats)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .forEach(([gpid, count]) => {
          console.log(`  GPID ${gpid}: ${count} games`);
        });
    }
  } catch (error) {
    console.error('❌ Lỗi lấy thống kê database:', error);
  }

  console.log('\n📊 Tổng kết:');
  console.log(`✅ Thành công: ${successCount} GPIDs`);
  console.log(`❌ Thất bại: ${errorCount} GPIDs`);
  console.log(`⏱️ Tổng thời gian: ${totalDuration}ms`);

  return {
    category: categoryConfig.name,
    successCount,
    errorCount,
    totalDuration,
    totalGames: categoryGames?.length || 0
  };
}

// Liệt kê các category hợp lệ từ menu
function listCategories() {
  console.log('📋 Các category hợp lệ từ menu:');
  Object.entries(MENU_CATEGORY_CONFIGS).forEach(([key, config]) => {
    console.log(`  ${key}: ${config.name} (${config.gpids.length} GPIDs: ${config.gpids.join(', ')})`);
  });
}

// Fetch tất cả các category trong menu
async function fetchAllCategories() {
  const startTime = Date.now();
  console.log('🎰 Bắt đầu fetch tất cả category từ menu...');
  const categories = Object.keys(MENU_CATEGORY_CONFIGS);
  let totalSuccessCount = 0;
  let totalErrorCount = 0;
  let totalGamesFetched = 0;

  for (const categoryKey of categories) {
    const categoryConfig = MENU_CATEGORY_CONFIGS[categoryKey];
    console.log(`\n🎯 Đang xử lý category: ${categoryConfig.name}`);
    try {
      const result = await fetchGamesByCategory(categoryKey);
      totalSuccessCount++;
      totalGamesFetched += result.totalGames;
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Lỗi khi xử lý category ${categoryConfig.name}:`, error);
      totalErrorCount++;
    }
  }

  const endTime = Date.now();
  const totalDuration = endTime - startTime;

  console.log('\n📊 Tổng kết toàn bộ:');
  console.log(`✅ Thành công: ${totalSuccessCount} category`);
  console.log(`❌ Thất bại: ${totalErrorCount} category`);
  console.log(`🎮 Tổng số game fetch được: ${totalGamesFetched}`);
  console.log(`⏱️ Tổng thời gian: ${totalDuration}ms`);

  // Lấy thống kê cuối cùng từ database
  try {
    const { data: allGames, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    if (error) {
      console.error('❌ Lỗi lấy thống kê cuối:', error);
    } else {
      const categoryStats = {};
      allGames.forEach(game => {
        categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
      });
      console.log('\n📊 Thống kê cuối cùng trong database:');
      console.log(`📊 Tổng số game: ${allGames.length} (total: ${count})`);
      Object.entries(categoryStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count} games`);
        });
    }
  } catch (error) {
    console.error('❌ Lỗi lấy thống kê database:', error);
  }
}

// Hàm main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('❌ Cách dùng: node fetch-games-by-category.js <category> [gpid1] [gpid2] ...');
    console.log('   hoặc: node fetch-games-by-category.js --list (xem các category hợp lệ)');
    console.log('   hoặc: node fetch-games-by-category.js --all (fetch tất cả category)');
    console.log('');
    console.log('Ví dụ:');
    console.log('  node fetch-games-by-category.js casino');
    console.log('  node fetch-games-by-category.js thethao');
    console.log('  node fetch-games-by-category.js "Custom Category" 1 2 3 4');
    console.log('  node fetch-games-by-category.js --all');
    process.exit(1);
  }

  if (args[0] === '--list') {
    listCategories();
    return;
  }

  if (args[0] === '--all') {
    await fetchAllCategories();
    return;
  }

  const category = args[0];
  const customGpids = args.slice(1).map(arg => {
    const gpid = parseInt(arg);
    if (isNaN(gpid)) {
      throw new Error(`GPID không hợp lệ: ${arg}`);
    }
    return gpid;
  });

  const gpidsToUse = customGpids.length > 0 ? customGpids : null;
  await fetchGamesByCategory(category, gpidsToUse);
}

// Chạy script
main().catch(error => {
  console.error('❌ Script thất bại:', error);
  process.exit(1);
});