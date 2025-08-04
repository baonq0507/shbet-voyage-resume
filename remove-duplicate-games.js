// Script để xóa các game trùng nhau trong database
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://206.206.126.141:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeDuplicateGames() {
  console.log('🧹 Starting to remove duplicate games...');
  
  try {
    // Get all games from database
    const { data: allGames, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Error getting games:', error);
      return;
    }
    
    console.log(`📊 Total games before deduplication: ${allGames.length} (total: ${count})`);
    
    // Find duplicates by game_id
    const gameIdCounts = {};
    const duplicates = [];
    
    allGames.forEach(game => {
      gameIdCounts[game.game_id] = (gameIdCounts[game.game_id] || 0) + 1;
    });
    
    // Find games with duplicates
    Object.entries(gameIdCounts).forEach(([gameId, count]) => {
      if (count > 1) {
        const duplicateGames = allGames.filter(game => game.game_id === gameId);
        duplicates.push(...duplicateGames.slice(1)); // Keep first one, mark others for deletion
      }
    });
    
    console.log(`🔍 Found ${duplicates.length} duplicate games to remove`);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate games found!');
      return;
    }
    
    // Show some sample duplicates
    console.log('\n📋 Sample duplicates to be removed:');
    duplicates.slice(0, 5).forEach(game => {
      console.log(`  - ${game.name} (ID: ${game.game_id}, GPID: ${game.gpid})`);
    });
    
    // Delete duplicate games
    console.log('\n🗑️ Removing duplicate games...');
    
    // Delete in batches to avoid overwhelming the database
    const batchSize = 50;
    let deletedCount = 0;
    
    for (let i = 0; i < duplicates.length; i += batchSize) {
      const batch = duplicates.slice(i, i + batchSize);
      const gameIdsToDelete = batch.map(game => game.game_id);
      
      console.log(`🗑️ Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(duplicates.length / batchSize)} (${batch.length} games)...`);
      
      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .in('game_id', gameIdsToDelete);
      
      if (deleteError) {
        console.error('❌ Error deleting batch:', deleteError);
        continue;
      }
      
      deletedCount += batch.length;
      console.log(`✅ Deleted ${batch.length} games in this batch`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} duplicate games`);
    
    // Get final count
    const { data: finalGames, error: finalError, count: finalCount } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    
    if (finalError) {
      console.error('❌ Error getting final count:', finalError);
    } else {
      console.log(`📊 Final games count: ${finalGames.length} (total: ${finalCount})`);
      console.log(`📉 Removed ${allGames.length - finalGames.length} duplicate games`);
    }
    
    // Show final stats by GPID
    const gpidStats = {};
    finalGames.forEach(game => {
      gpidStats[game.gpid] = (gpidStats[game.gpid] || 0) + 1;
    });
    
    console.log('\n📊 Final games by GPID:');
    Object.entries(gpidStats)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([gpid, count]) => {
        console.log(`  GPID ${gpid}: ${count} games`);
      });
    
  } catch (error) {
    console.error('❌ Error removing duplicate games:', error);
  }
}

// Alternative method: Use SQL to remove duplicates
async function removeDuplicatesWithSQL() {
  console.log('🧹 Using SQL method to remove duplicates...');
  
  try {
    // First, get count before
    const { data: beforeGames, error: beforeError, count: beforeCount } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    
    if (beforeError) {
      console.error('❌ Error getting initial count:', beforeError);
      return;
    }
    
    console.log(`📊 Games before SQL deduplication: ${beforeGames.length} (total: ${beforeCount})`);
    
    // Use SQL to delete duplicates, keeping the first occurrence
    const { error: sqlError } = await supabase.rpc('remove_duplicate_games');
    
    if (sqlError) {
      console.error('❌ SQL deduplication failed:', sqlError);
      console.log('🔄 Falling back to JavaScript method...');
      await removeDuplicateGames();
      return;
    }
    
    // Get final count
    const { data: afterGames, error: afterError, count: afterCount } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    
    if (afterError) {
      console.error('❌ Error getting final count:', afterError);
    } else {
      console.log(`📊 Games after SQL deduplication: ${afterGames.length} (total: ${afterCount})`);
      console.log(`📉 Removed ${beforeGames.length - afterGames.length} duplicate games`);
    }
    
  } catch (error) {
    console.error('❌ Error with SQL deduplication:', error);
    console.log('🔄 Falling back to JavaScript method...');
    await removeDuplicateGames();
  }
}

// Run the deduplication
console.log('🎯 Choose deduplication method:');
console.log('1. JavaScript method (recommended)');
console.log('2. SQL method (if available)');

// For now, use JavaScript method
removeDuplicateGames(); 