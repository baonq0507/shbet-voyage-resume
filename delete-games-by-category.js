// Script để xóa games từ database theo category
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://206.206.126.141:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteGamesByCategory(category) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] 🗑️ Starting deleteGamesByCategory - Category: ${category}`);
    
    // First, get count of games to be deleted
    const { data: gamesToDelete, error: countError, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' })
      .eq('category', category);
    
    if (countError) {
      console.error(`[${requestId}] ❌ Error counting games for category ${category}:`, countError);
      throw countError;
    }
    
    const gameCount = gamesToDelete?.length || 0;
    console.log(`[${requestId}] 📊 Found ${gameCount} games to delete for category: ${category}`);
    
    if (gameCount === 0) {
      console.log(`[${requestId}] ⚠️ No games found for category: ${category}`);
      return { deleted: 0, category };
    }
    
    // Show sample games that will be deleted
    console.log(`[${requestId}] 📋 Sample games to be deleted:`);
    gamesToDelete.slice(0, 5).forEach(game => {
      console.log(`  - ${game.name} (ID: ${game.game_id}, GPID: ${game.gpid}, Type: ${game.type})`);
    });
    
    if (gameCount > 5) {
      console.log(`  ... and ${gameCount - 5} more games`);
    }
    
    // Show stats by GPID for this category
    const gpidStats = {};
    gamesToDelete.forEach(game => {
      gpidStats[game.gpid] = (gpidStats[game.gpid] || 0) + 1;
    });
    
    console.log(`[${requestId}] 📊 Games by GPID in category "${category}":`);
    Object.entries(gpidStats)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([gpid, count]) => {
        console.log(`  GPID ${gpid}: ${count} games`);
      });
    
    // Delete games by category
    const { data: deletedGames, error: deleteError } = await supabase
      .from('games')
      .delete()
      .eq('category', category)
      .select();
    
    if (deleteError) {
      console.error(`[${requestId}] ❌ Error deleting games for category ${category}:`, deleteError);
      throw deleteError;
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[${requestId}] ✅ Successfully deleted ${deletedGames.length} games for category "${category}" in ${duration}ms`);
    
    return { deleted: deletedGames.length, category };
    
  } catch (error) {
    console.error(`[${requestId}] ❌ deleteGamesByCategory failed for category ${category}:`, error);
    throw error;
  }
}

async function deleteMultipleCategories(categories) {
  const startTime = Date.now();
  console.log('🗑️ Starting to delete games for multiple categories...');
  console.log(`📋 Processing ${categories.length} categories:`, categories);
  
  let successCount = 0;
  let errorCount = 0;
  let totalDeleted = 0;
  const results = [];
  
  // Process each category sequentially
  for (const category of categories) {
    try {
      const result = await deleteGamesByCategory(category);
      results.push(result);
      totalDeleted += result.deleted;
      successCount++;
      
      // Add a small delay between operations
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error deleting category ${category}:`, error);
      errorCount++;
      results.push({ deleted: 0, category, error: error.message });
    }
  }
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  console.log('\n📊 Deletion Summary:');
  console.log(`✅ Successfully processed: ${successCount} categories`);
  console.log(`❌ Failed: ${errorCount} categories`);
  console.log(`🗑️ Total games deleted: ${totalDeleted}`);
  console.log(`⏱️ Total time: ${totalDuration}ms`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    if (result.error) {
      console.log(`  Category "${result.category}": ❌ Error - ${result.error}`);
    } else {
      console.log(`  Category "${result.category}": ✅ Deleted ${result.deleted} games`);
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
      
      // Get stats by category
      const categoryStats = {};
      allGames.forEach(game => {
        categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
      });
      
      if (Object.keys(categoryStats).length > 0) {
        console.log('📊 Remaining games by category:');
        Object.entries(categoryStats)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([category, count]) => {
            console.log(`  ${category}: ${count} games`);
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

// Function to delete a single category
async function deleteSingleCategory(category) {
  console.log(`🎯 Deleting single category: ${category}`);
  return await deleteMultipleCategories([category]);
}

// Function to delete all categories
async function deleteAllCategories() {
  // Get all unique categories from database
  try {
    const { data: allGames, error } = await supabase
      .from('games')
      .select('category');
    
    if (error) {
      console.error('❌ Error getting categories from database:', error);
      throw error;
    }
    
    // Get unique categories
    const uniqueCategories = [...new Set(allGames.map(game => game.category))];
    
    if (uniqueCategories.length === 0) {
      console.log('📊 No categories found in database');
      return;
    }
    
    console.log('🎰 Deleting all categories from database...');
    console.log(`📋 Found ${uniqueCategories.length} categories:`, uniqueCategories);
    
    return await deleteMultipleCategories(uniqueCategories);
    
  } catch (error) {
    console.error('❌ Error getting categories from database:', error);
    throw error;
  }
}

// Function to list all categories in database
async function listCategories() {
  try {
    const { data: allGames, error } = await supabase
      .from('games')
      .select('category');
    
    if (error) {
      console.error('❌ Error getting categories from database:', error);
      return;
    }
    
    // Get unique categories with counts
    const categoryStats = {};
    allGames.forEach(game => {
      categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
    });
    
    if (Object.keys(categoryStats).length === 0) {
      console.log('📊 No categories found in database');
      return;
    }
    
    console.log('📋 Categories in database:');
    Object.entries(categoryStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} games`);
      });
    
  } catch (error) {
    console.error('❌ Error listing categories:', error);
  }
}

// Main execution function
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Usage: node delete-games-by-category.js <category1> [category2] [category3] ...');
    console.log('   or: node delete-games-by-category.js --all (delete all categories)');
    console.log('   or: node delete-games-by-category.js --list (list all categories)');
    console.log('');
    console.log('Examples:');
    console.log('  node delete-games-by-category.js "Casino"');
    console.log('  node delete-games-by-category.js "Sports" "Nohu"');
    console.log('  node delete-games-by-category.js --all');
    console.log('  node delete-games-by-category.js --list');
    process.exit(1);
  }
  
  if (args[0] === '--list') {
    await listCategories();
    return;
  }
  
  if (args[0] === '--all') {
    await deleteAllCategories();
    return;
  }
  
  // Parse categories from command line arguments
  const categories = args;
  
  if (categories.length === 1) {
    await deleteSingleCategory(categories[0]);
  } else {
    await deleteMultipleCategories(categories);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 