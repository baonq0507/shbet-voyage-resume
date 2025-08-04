// Script kiểm tra số lượng games trong database
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://206.206.126.141:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGamesCount() {
  console.log('🔍 Checking games count in database...');
  
  try {
    // Get total count
    const { data: allGames, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Error getting games count:', error);
      return;
    }
    
    console.log(`📊 Total games in database: ${allGames.length} (total: ${count})`);
    
    // Get stats by GPID
    const gpidStats = {};
    allGames.forEach(game => {
      gpidStats[game.gpid] = (gpidStats[game.gpid] || 0) + 1;
    });
    
    console.log('\n📊 Games by GPID:');
    Object.entries(gpidStats)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([gpid, count]) => {
        console.log(`  GPID ${gpid}: ${count} games`);
      });
    
    // Get stats by category
    const categoryStats = {};
    allGames.forEach(game => {
      categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
    });
    
    console.log('\n📊 Games by Category:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} games`);
      });
    
    // Get stats by provider
    const providerStats = {};
    allGames.forEach(game => {
      providerStats[game.provider] = (providerStats[game.provider] || 0) + 1;
    });
    
    console.log('\n📊 Games by Provider:');
    Object.entries(providerStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Show top 10 providers
      .forEach(([provider, count]) => {
        console.log(`  ${provider}: ${count} games`);
      });
    
    // Show some sample games
    console.log('\n📋 Sample games:');
    allGames.slice(0, 5).forEach(game => {
      console.log(`  - ${game.name} (GPID: ${game.gpid}, Provider: ${game.provider}, Type: ${game.type})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking games count:', error);
  }
}

// Run the check
checkGamesCount(); 