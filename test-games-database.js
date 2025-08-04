// Script test cho hệ thống database games
// Chạy: node test-games-database.js

const SUPABASE_URL = 'https://your-project.supabase.co'; // Thay đổi URL của bạn
const SUPABASE_ANON_KEY = 'your-anon-key'; // Thay đổi key của bạn

async function testSyncGamesDatabase() {
  console.log('🔄 Testing sync-games-database function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-games-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        gpids: [1, 5, 6], // Test với 3 GPID đầu tiên
        category: 'casino'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Sync successful!');
      console.log('📊 Results:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ Sync failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing sync:', error);
  }
}

async function testGetGamesFromDatabase() {
  console.log('\n🔄 Testing get-games-from-database function...');
  
  try {
    // Test 1: Lấy tất cả games
    console.log('📡 Test 1: Get all games');
    let response = await fetch(`${SUPABASE_URL}/functions/v1/get-games-from-database?limit=5`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    let result = await response.json();
    if (result.success) {
      console.log(`✅ Found ${result.data.games.length} games`);
      console.log('📊 Sample games:', result.data.games.slice(0, 2));
    }

    // Test 2: Filter theo category
    console.log('\n📡 Test 2: Filter by category');
    response = await fetch(`${SUPABASE_URL}/functions/v1/get-games-from-database?category=Baccarat&limit=3`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    result = await response.json();
    if (result.success) {
      console.log(`✅ Found ${result.data.games.length} Baccarat games`);
    }

    // Test 3: Search
    console.log('\n📡 Test 3: Search games');
    response = await fetch(`${SUPABASE_URL}/functions/v1/get-games-from-database?search=baccarat&limit=3`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    result = await response.json();
    if (result.success) {
      console.log(`✅ Found ${result.data.games.length} games matching "baccarat"`);
    }

    // Test 4: Filter theo GPID
    console.log('\n📡 Test 4: Filter by GPID');
    response = await fetch(`${SUPABASE_URL}/functions/v1/get-games-from-database?gpid=1&limit=3`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    result = await response.json();
    if (result.success) {
      console.log(`✅ Found ${result.data.games.length} games from GPID 1`);
    }

    // Test 5: Available filters
    console.log('\n📡 Test 5: Get available filters');
    response = await fetch(`${SUPABASE_URL}/functions/v1/get-games-from-database?limit=1`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    result = await response.json();
    if (result.success) {
      console.log('✅ Available filters:');
      console.log('Categories:', result.data.filters.available.categories);
      console.log('Types:', result.data.filters.available.types);
      console.log('Providers:', result.data.filters.available.providers);
      console.log('GPIDs:', result.data.filters.available.gpids);
    }

  } catch (error) {
    console.error('❌ Error testing get games:', error);
  }
}

async function testFullWorkflow() {
  console.log('\n🚀 Testing full workflow...');
  
  try {
    // Step 1: Sync games
    console.log('📡 Step 1: Syncing games from API...');
    const syncResponse = await fetch(`${SUPABASE_URL}/functions/v1/sync-games-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        gpids: [1, 5], // Test với 2 GPID
        category: 'casino'
      })
    });

    const syncResult = await syncResponse.json();
    
    if (syncResult.success) {
      console.log(`✅ Sync completed: ${syncResult.data.totalGames} games processed`);
      
      // Step 2: Wait a bit for database to update
      console.log('⏳ Waiting 2 seconds for database to update...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Get games from database
      console.log('📡 Step 2: Getting games from database...');
      const getResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-games-from-database?limit=10`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const getResult = await getResponse.json();
      
      if (getResult.success) {
        console.log(`✅ Retrieved ${getResult.data.games.length} games from database`);
        console.log('📊 Database stats:');
        console.log('- Total games:', getResult.data.pagination.total);
        console.log('- Available categories:', getResult.data.filters.available.categories.length);
        console.log('- Available providers:', getResult.data.filters.available.providers.length);
      }
    }
  } catch (error) {
    console.error('❌ Error in full workflow test:', error);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Games Database Tests...\n');
  
  // Test individual functions
  await testSyncGamesDatabase();
  await testGetGamesFromDatabase();
  
  // Test full workflow
  await testFullWorkflow();
  
  console.log('\n✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSyncGamesDatabase,
  testGetGamesFromDatabase,
  testFullWorkflow,
  runTests
}; 