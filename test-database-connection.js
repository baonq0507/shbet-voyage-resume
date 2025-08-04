// Script test kết nối database và bảng games
import { createClient } from '@supabase/supabase-js';

// Supabase local configuration
const supabaseUrl = 'http://206.206.126.141:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check if games table exists by trying to query it
    console.log('📊 Test 1: Checking games table...');
    const { data: games, error: tableError } = await supabase
      .from('games')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Error checking games table:', tableError);
      console.log('❌ Games table not found or not accessible');
      return;
    }
    
    console.log('✅ Games table exists and is accessible!');
    
    // Test 2: Get table structure by querying a single row
    console.log('\n📋 Test 2: Checking table structure...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('games')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error getting sample data:', sampleError);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('📊 Games table structure (from sample data):');
      const columns = Object.keys(sampleData[0]);
      columns.forEach(col => {
        console.log(`  - ${col}: ${typeof sampleData[0][col]}`);
      });
    } else {
      console.log('📊 Games table is empty, will test with sample data');
    }
    
    // Test 3: Insert sample data
    console.log('\n📝 Test 3: Inserting sample data...');
    const sampleGame = {
      game_id: 'test_1_123',
      name: 'Test Baccarat Game',
      image: 'https://via.placeholder.com/300x200?text=Test+Game',
      type: 'Baccarat',
      category: 'Live Casino',
      is_active: true,
      provider: 'BigGaming',
      rank: 1,
      gpid: 1,
      game_provider_id: 1,
      game_type: 101,
      new_game_type: 101,
      rtp: 96.50,
      rows: 0,
      reels: 0,
      lines: 0,
      is_maintain: false,
      is_enabled: true,
      is_provider_online: true,
      supported_currencies: ['USD', 'EUR'],
      block_countries: ['US', 'UK']
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('games')
      .insert(sampleGame)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError);
      return;
    }
    
    console.log('✅ Sample data inserted successfully!');
    console.log('📊 Inserted game:', insertData[0]);
    
    // Test 4: Query data
    console.log('\n🔍 Test 4: Querying data...');
    const { data: allGames, error: queryError, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    
    if (queryError) {
      console.error('❌ Error querying data:', queryError);
      return;
    }
    
    console.log(`✅ Found ${allGames.length} games in database (total: ${count})`);
    
    // Test 5: Test filters
    console.log('\n🔍 Test 5: Testing filters...');
    const { data: baccaratGames, error: filterError } = await supabase
      .from('games')
      .select('*')
      .eq('type', 'Baccarat');
    
    if (filterError) {
      console.error('❌ Error filtering data:', filterError);
      return;
    }
    
    console.log(`✅ Found ${baccaratGames.length} Baccarat games`);
    
    // Test 6: Test GPID filter
    console.log('\n🔍 Test 6: Testing GPID filter...');
    const { data: gpidGames, error: gpidError } = await supabase
      .from('games')
      .select('*')
      .eq('gpid', 1);
    
    if (gpidError) {
      console.error('❌ Error filtering by GPID:', gpidError);
      return;
    }
    
    console.log(`✅ Found ${gpidGames.length} games from GPID 1`);
    
    // Test 7: Get unique values for filters
    console.log('\n🔍 Test 7: Getting unique filter values...');
    const { data: categories } = await supabase
      .from('games')
      .select('category')
      .not('category', 'is', null);
    
    const { data: types } = await supabase
      .from('games')
      .select('type')
      .not('type', 'is', null);
    
    const { data: providers } = await supabase
      .from('games')
      .select('provider')
      .not('provider', 'is', null);
    
    const { data: gpids } = await supabase
      .from('games')
      .select('gpid')
      .not('gpid', 'is', null);
    
    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];
    const uniqueTypes = [...new Set(types?.map(t => t.type) || [])];
    const uniqueProviders = [...new Set(providers?.map(p => p.provider) || [])];
    const uniqueGpids = [...new Set(gpids?.map(g => g.gpid) || [])];
    
    console.log('📊 Available filters:');
    console.log('  Categories:', uniqueCategories);
    console.log('  Types:', uniqueTypes);
    console.log('  Providers:', uniqueProviders);
    console.log('  GPIDs:', uniqueGpids.sort((a, b) => a - b));
    
    console.log('\n✅ All database tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the test
testDatabaseConnection(); 