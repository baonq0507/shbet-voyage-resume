// Script để xóa games từ database theo GPID
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://api.dinamondbet68.com/';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteGamesByGPID(gpid) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] 🗑️ Starting deleteGamesByGPID - GPID: ${gpid}`);
    
    // First, get count of games to be deleted
    const { data: gamesToDelete, error: countError, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' })
      .eq('gpid', gpid);
    
    if (countError) {
      console.error(`[${requestId}] ❌ Error counting games for GPID ${gpid}:`, countError);
      throw countError;
    }
    
    const gameCount = gamesToDelete?.length || 0;
    console.log(`[${requestId}] 📊 Found ${gameCount} games to delete for GPID ${gpid}`);
    
    if (gameCount === 0) {
      console.log(`[${requestId}] ⚠️ No games found for GPID ${gpid}`);
      return { deleted: 0, gpid };
    }
    
    // Show sample games that will be deleted
    console.log(`[${requestId}] 📋 Sample games to be deleted:`);
    gamesToDelete.slice(0, 3).forEach(game => {
      console.log(`  - ${game.name} (ID: ${game.game_id}, Type: ${game.type})`);
    });
    
    if (gameCount > 3) {
      console.log(`  ... and ${gameCount - 3} more games`);
    }
    
    // Delete games by GPID
    const { data: deletedGames, error: deleteError } = await supabase
      .from('games')
      .delete()
      .eq('gpid', gpid)
      .select();
    
    if (deleteError) {
      console.error(`[${requestId}] ❌ Error deleting games for GPID ${gpid}:`, deleteError);
      throw deleteError;
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[${requestId}] ✅ Successfully deleted ${deletedGames.length} games for GPID ${gpid} in ${duration}ms`);
    
    return { deleted: deletedGames.length, gpid };
    
  } catch (error) {
    console.error(`[${requestId}] ❌ deleteGamesByGPID failed for GPID ${gpid}:`, error);
    throw error;
  }
}

async function deleteMultipleGPIDs(gpids) {
  const startTime = Date.now();
  console.log('🗑️ Starting to delete games for multiple GPIDs...');
  console.log(`📋 Processing ${gpids.length} GPIDs:`, gpids);
  
  let successCount = 0;
  let errorCount = 0;
  let totalDeleted = 0;
  const results = [];
  
  // Process each GPID sequentially
  for (const gpid of gpids) {
    try {
      const result = await deleteGamesByGPID(gpid);
      results.push(result);
      totalDeleted += result.deleted;
      successCount++;
      
      // Add a small delay between operations
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error deleting GPID ${gpid}:`, error);
      errorCount++;
      results.push({ deleted: 0, gpid, error: error.message });
    }
  }
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  console.log('\n📊 Deletion Summary:');
  console.log(`✅ Successfully processed: ${successCount} GPIDs`);
  console.log(`❌ Failed: ${errorCount} GPIDs`);
  console.log(`🗑️ Total games deleted: ${totalDeleted}`);
  console.log(`⏱️ Total time: ${totalDuration}ms`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    if (result.error) {
      console.log(`  GPID ${result.gpid}: ❌ Error - ${result.error}`);
    } else {
      console.log(`  GPID ${result.gpid}: ✅ Deleted ${result.deleted} games`);
    }
  });
  
  // Get final database stats
  try {
    const { data: allGames, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Error getting final stats:', error);
    } else {
      console.log(`\n📊 Final database stats:`);
      console.log(`📊 Total games remaining in database: ${allGames.length} (total: ${count})`);
      
      // Get stats by GPID
      const gpidStats = {};
      allGames.forEach(game => {
        gpidStats[game.gpid] = (gpidStats[game.gpid] || 0) + 1;
      });
      
      if (Object.keys(gpidStats).length > 0) {
        console.log('📊 Remaining games by GPID:');
        Object.entries(gpidStats)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .forEach(([gpid, count]) => {
            console.log(`  GPID ${gpid}: ${count} games`);
          });
      } else {
        console.log('📊 No games remaining in database');
      }
    }
  } catch (error) {
    console.error('❌ Error getting final database stats:', error);
  }
  
  return results;
}

// Function to delete a single GPID
async function deleteSingleGPID(gpid) {
  console.log(`🎯 Deleting single GPID: ${gpid}`);
  return await deleteMultipleGPIDs([gpid]);
}

// Function to delete all casino GPIDs (same as in fetch script)
async function deleteAllCasinoGPIDs() {
  const CASINO_GPIDS = [2,3,12,13,14,22,29,35,1009,1010,1012,1016,1018];
  console.log('🎰 Deleting all casino games...');
  return await deleteMultipleGPIDs(CASINO_GPIDS);
}

// Main execution function
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Usage: node delete-games-by-gpid.js <gpid1> [gpid2] [gpid3] ...');
    console.log('   or: node delete-games-by-gpid.js --all (delete all casino GPIDs)');
    console.log('   or: node delete-games-by-gpid.js --casino (delete all casino GPIDs)');
    process.exit(1);
  }
  
  if (args[0] === '--all' || args[0] === '--casino') {
    await deleteAllCasinoGPIDs();
  } else {
    // Parse GPIDs from command line arguments
    const gpids = args.map(arg => {
      const gpid = parseInt(arg);
      if (isNaN(gpid)) {
        throw new Error(`Invalid GPID: ${arg}`);
      }
      return gpid;
    });
    
    if (gpids.length === 1) {
      await deleteSingleGPID(gpids[0]);
    } else {
      await deleteMultipleGPIDs(gpids);
    }
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 