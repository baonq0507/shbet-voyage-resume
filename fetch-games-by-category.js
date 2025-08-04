// Script để fetch games từ API cho category và GPIDs cụ thể
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://206.206.126.141:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// API Configuration
const API_CONFIG = {
  baseUrl: "https://ex-api-yy5.tw946.com/web-root/restricted/information/get-game-list.aspx",
  companyKey: "C6012BA39EB643FEA4F5CD49AF138B02",
  serverId: "206.206.126.141"
};

// Predefined category configurations
const CATEGORY_CONFIGS = {
  'casino': {
    name: 'Casino',
    gpids: [1, 5, 6, 10, 11, 20, 28, 33, 38, 1019, 1021, 1022, 1024]
  },
  'nohu': {
    name: 'Nohu',
    gpids: [2, 3, 12, 13, 14, 22, 29, 35, 1009, 1010, 1012, 1016, 1018]
  },
  'sports': {
    name: 'Sports',
    gpids: [44, 1015, 1022, 1053, 1070, 1080, 1066]
  },
  'slot': {
    name: 'Slot',
    gpids: [1, 2, 3, 5, 6, 10, 11, 12, 13, 14, 20, 22, 28, 29, 33, 35, 38]
  },
  'live': {
    name: 'Live Casino',
    gpids: [1009, 1010, 1012, 1016, 1018, 1019, 1021, 1022, 1024]
  }
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchGamesFromAPI(gpid, category) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] 🚀 Starting fetchGamesFromAPI - GPID: ${gpid}, Category: ${category}`);
    console.log(`[${requestId}] 📡 API URL: ${API_CONFIG.baseUrl}`);

    const requestBody = {
      CompanyKey: API_CONFIG.companyKey,
      ServerId: API_CONFIG.serverId,
      Gpid: gpid
    };
    
    console.log(`[${requestId}] 📤 Request payload:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`[${requestId}] 📥 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] ❌ API request failed - Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`API request failed with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`[${requestId}] 📊 Raw API response received for GPID ${gpid}`);
    
    if (data.error.id !== 0) {
      console.error(`[${requestId}] ❌ API returned error - ID: ${data.error.id}, Message: ${data.error.msg}`);
      throw new Error(data.error.msg || 'API returned error');
    }

    if (!data.seamlessGameProviderGames || !Array.isArray(data.seamlessGameProviderGames)) {
      console.error(`[${requestId}] ❌ Invalid data format - seamlessGameProviderGames is not an array`);
      throw new Error('Invalid data format from API');
    }

    console.log(`[${requestId}] 📋 Total games from API for GPID ${gpid}: ${data.seamlessGameProviderGames.length}`);

    // Transform API data to database format
    const games = data.seamlessGameProviderGames
      .filter(game => {
        const isEnabled = game.isEnabled && !game.isMaintain;
        if (!isEnabled) {
          console.log(`[${requestId}] ⏭️ Skipping disabled/maintenance game: ${game.gameID} (enabled: ${game.isEnabled}, maintain: ${game.isMaintain})`);
        }
        return isEnabled;
      })
      .map((game) => {
        // Get English game info, fallback to first available
        const gameInfo = game.gameInfos.find(info => info.language !== null) || game.gameInfos[0];
        
        const transformedGame = {
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
        
        console.log(`[${requestId}] 🎮 Transformed game: ${transformedGame.name} (ID: ${transformedGame.game_id}, Category: ${transformedGame.category})`);
        return transformedGame;
      })
      .sort((a, b) => a.rank - b.rank); // Sort by rank

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`[${requestId}] ✅ fetchGamesFromAPI completed for GPID ${gpid} in ${duration}ms - Found ${games.length} games`);
    
    return games;
  } catch (error) {
    console.error(`[${requestId}] ❌ fetchGamesFromAPI failed for GPID ${gpid}:`, error);
    throw error;
  }
}

async function saveGamesToDatabase(games) {
  if (games.length === 0) {
    console.log('📝 No games to save to database');
    return;
  }

  try {
    console.log(`📝 Saving ${games.length} games to database...`);
    
    // Use insert instead of upsert since there's no unique constraint
    const { data, error } = await supabase
      .from('games')
      .insert(games)
      .select();

    if (error) {
      console.error('❌ Error saving games to database:', error);
      throw error;
    }

    console.log(`✅ Successfully saved ${data.length} games to database`);
    
    // Log some sample saved games
    if (data.length > 0) {
      console.log('📊 Sample saved games:');
      data.slice(0, 3).forEach(game => {
        console.log(`  - ${game.name} (GPID: ${game.gpid}, Category: ${game.category})`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to save games to database:', error);
    throw error;
  }
}

async function processGPID(gpid, category) {
  const startTime = Date.now();
  console.log(`\n🎯 Processing GPID: ${gpid} for category: ${category}`);
  
  try {
    // Fetch games from API
    const games = await fetchGamesFromAPI(gpid, category);
    
    if (games.length === 0) {
      console.log(`⚠️ No games found for GPID ${gpid}`);
      return;
    }
    
    // Save games to database
    await saveGamesToDatabase(games);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ GPID ${gpid} processed successfully in ${duration}ms`);
    
  } catch (error) {
    console.error(`❌ Failed to process GPID ${gpid}:`, error);
    // Continue with next GPID instead of stopping
  }
}

async function fetchGamesByCategory(category, customGpids = null) {
  const startTime = Date.now();
  
  // Get category configuration
  let categoryConfig;
  let gpids;
  
  if (customGpids) {
    // Use custom GPIDs if provided
    categoryConfig = { name: category, gpids: customGpids };
    gpids = customGpids;
    console.log(`🎯 Using custom GPIDs for category: ${category}`);
  } else if (CATEGORY_CONFIGS[category.toLowerCase()]) {
    // Use predefined category configuration
    categoryConfig = CATEGORY_CONFIGS[category.toLowerCase()];
    gpids = categoryConfig.gpids;
    console.log(`🎯 Using predefined configuration for category: ${categoryConfig.name}`);
  } else {
    throw new Error(`Unknown category: ${category}. Available categories: ${Object.keys(CATEGORY_CONFIGS).join(', ')}`);
  }
  
  console.log(`🎰 Starting to fetch games for category: ${categoryConfig.name}`);
  console.log(`📋 Processing ${gpids.length} GPIDs:`, gpids);
  
  let successCount = 0;
  let errorCount = 0;
  let totalGamesFetched = 0;
  
  // Process each GPID sequentially to avoid overwhelming the API
  for (const gpid of gpids) {
    try {
      await processGPID(gpid, categoryConfig.name);
      successCount++;
      
      // Add a small delay between requests to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error processing GPID ${gpid}:`, error);
      errorCount++;
    }
  }
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully processed: ${successCount} GPIDs`);
  console.log(`❌ Failed: ${errorCount} GPIDs`);
  console.log(`⏱️ Total time: ${totalDuration}ms`);
  
  // Get final database stats for this category
  try {
    const { data: categoryGames, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' })
      .eq('category', categoryConfig.name);
    
    if (error) {
      console.error('❌ Error getting final stats:', error);
    } else {
      console.log(`📊 Total games for category "${categoryConfig.name}" in database: ${categoryGames.length} (total: ${count})`);
      
      // Get stats by GPID for this category
      const gpidStats = {};
      categoryGames.forEach(game => {
        gpidStats[game.gpid] = (gpidStats[game.gpid] || 0) + 1;
      });
      
      console.log(`📊 Games by GPID for category "${categoryConfig.name}":`);
      Object.entries(gpidStats)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .forEach(([gpid, count]) => {
          console.log(`  GPID ${gpid}: ${count} games`);
        });
    }
  } catch (error) {
    console.error('❌ Error getting final database stats:', error);
  }
  
  return {
    category: categoryConfig.name,
    successCount,
    errorCount,
    totalDuration,
    totalGames: categoryGames?.length || 0
  };
}

// Function to list available categories
function listCategories() {
  console.log('📋 Available predefined categories:');
  Object.entries(CATEGORY_CONFIGS).forEach(([key, config]) => {
    console.log(`  ${key}: ${config.name} (${config.gpids.length} GPIDs: ${config.gpids.join(', ')})`);
  });
}

// Function to fetch all categories
async function fetchAllCategories() {
  const startTime = Date.now();
  console.log('🎰 Starting to fetch all categories...');
  
  const categories = Object.keys(CATEGORY_CONFIGS);
  console.log(`📋 Processing ${categories.length} categories:`, categories);
  
  let totalSuccessCount = 0;
  let totalErrorCount = 0;
  let totalGamesFetched = 0;
  
  for (const categoryKey of categories) {
    const categoryConfig = CATEGORY_CONFIGS[categoryKey];
    console.log(`\n🎯 Processing category: ${categoryConfig.name}`);
    
    try {
      const result = await fetchGamesByCategory(categoryKey);
      totalSuccessCount++;
      totalGamesFetched += result.totalGames;
      
      // Add delay between categories
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error processing category ${categoryConfig.name}:`, error);
      totalErrorCount++;
    }
  }
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  console.log('\n📊 Overall Summary:');
  console.log(`✅ Successfully processed: ${totalSuccessCount} categories`);
  console.log(`❌ Failed: ${totalErrorCount} categories`);
  console.log(`🎮 Total games fetched: ${totalGamesFetched}`);
  console.log(`⏱️ Total time: ${totalDuration}ms`);
  
  // Get final database stats for all categories
  try {
    const { data: allGames, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Error getting final stats:', error);
    } else {
      console.log(`\n📊 Final database stats:`);
      console.log(`📊 Total games in database: ${allGames.length} (total: ${count})`);
      
      // Get stats by category
      const categoryStats = {};
      allGames.forEach(game => {
        categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
      });
      
      console.log('📊 Games by category:');
      Object.entries(categoryStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count} games`);
        });
    }
  } catch (error) {
    console.error('❌ Error getting final database stats:', error);
  }
}

// Main execution function
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Usage: node fetch-games-by-category.js <category> [gpid1] [gpid2] ...');
    console.log('   or: node fetch-games-by-category.js --list (show available categories)');
    console.log('   or: node fetch-games-by-category.js --all (fetch all categories)');
    console.log('');
    console.log('Examples:');
    console.log('  node fetch-games-by-category.js casino');
    console.log('  node fetch-games-by-category.js sports');
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
      throw new Error(`Invalid GPID: ${arg}`);
    }
    return gpid;
  });
  
  // If custom GPIDs are provided, use them; otherwise use predefined category
  const gpidsToUse = customGpids.length > 0 ? customGpids : null;
  
  await fetchGamesByCategory(category, gpidsToUse);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 