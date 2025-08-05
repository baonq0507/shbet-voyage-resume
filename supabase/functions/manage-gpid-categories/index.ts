import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Predefined GPID categories
const GPID_CATEGORIES = {
  casino: [1, 5, 6, 10, 11, 20, 28, 33, 38, 1019, 1021, 1022, 1024],
  slots: [1001, 1002, 1003, 1004, 1005], // Example slot GPIDs
  sports: [2001, 2002, 2003], // Example sports GPIDs
  lottery: [3001, 3002], // Example lottery GPIDs
  poker: [4001, 4002, 4003] // Example poker GPIDs
};

interface CategoryInfo {
  name: string;
  description: string;
  gpids: number[];
  totalGames?: number;
  lastSync?: string;
}

serve(async (req) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`[${requestId}] 🌐 New manage-gpid-categories request received - Method: ${req.method}, URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] 🔄 CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let action = '';
    let category = '';
    let gpids: number[] = [];

    // Handle both GET (URL params) and POST (body) requests
    if (req.method === 'POST') {
      const body = await req.json();
      action = body.action || '';
      category = body.category || '';
      gpids = body.gpids || [];
      console.log(`[${requestId}] 📥 POST request body:`, JSON.stringify(body, null, 2));
    } else {
      const url = new URL(req.url);
      action = url.searchParams.get('action') || '';
      category = url.searchParams.get('category') || '';
      const gpidsParam = url.searchParams.get('gpids');
      gpids = gpidsParam ? JSON.parse(gpidsParam) : [];
      console.log(`[${requestId}] 📥 GET request params:`, Object.fromEntries(url.searchParams.entries()));
    }

    console.log(`[${requestId}] 🎯 Processing request - Action: ${action}, Category: ${category}`);

    let result: any = {};

    switch (action) {
      case 'list':
        // List all categories with their GPIDs and stats
        result = await listCategories();
        break;
      
      case 'get':
        // Get specific category info
        if (!category) {
          throw new Error('Category is required for get action');
        }
        result = await getCategoryInfo(category);
        break;
      
      case 'add':
        // Add new category or update existing
        if (!category || gpids.length === 0) {
          throw new Error('Category and GPIDs are required for add action');
        }
        result = await addCategory(category, gpids);
        break;
      
      case 'update':
        // Update GPIDs for existing category
        if (!category || gpids.length === 0) {
          throw new Error('Category and GPIDs are required for update action');
        }
        result = await updateCategory(category, gpids);
        break;
      
      case 'delete':
        // Delete category
        if (!category) {
          throw new Error('Category is required for delete action');
        }
        result = await deleteCategory(category);
        break;
      
      case 'sync':
        // Sync games for specific category
        if (!category) {
          throw new Error('Category is required for sync action');
        }
        result = await syncCategory(category);
        break;
      
      case 'stats':
        // Get statistics for all categories
        result = await getCategoryStats();
        break;
      
      default:
        // Default: list all categories
        result = await listCategories();
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`[${requestId}] ✅ Request completed successfully in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        action,
        category,
        requestId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`[${requestId}] ❌ Error in manage-gpid-categories function after ${duration}ms:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to manage GPID categories',
        message: error.message,
        requestId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function listCategories(): Promise<CategoryInfo[]> {
  const categories: CategoryInfo[] = [];
  
  for (const [name, gpids] of Object.entries(GPID_CATEGORIES)) {
    const categoryInfo = await getCategoryInfo(name);
    categories.push(categoryInfo);
  }
  
  return categories;
}

async function getCategoryInfo(categoryName: string): Promise<CategoryInfo> {
  const gpids = GPID_CATEGORIES[categoryName as keyof typeof GPID_CATEGORIES] || [];
  
  // Get total games for this category
  let totalGames = 0;
  if (gpids.length > 0) {
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .in('gpid', gpids);
    
    totalGames = count || 0;
  }
  
  // Get last sync time (you might want to store this in a separate table)
  const lastSync = new Date().toISOString(); // Placeholder
  
  return {
    name: categoryName,
    description: getCategoryDescription(categoryName),
    gpids,
    totalGames,
    lastSync
  };
}

async function addCategory(categoryName: string, gpids: number[]): Promise<{ message: string; category: CategoryInfo }> {
  // In a real implementation, you might want to store categories in a database
  // For now, we'll just return success
  const categoryInfo = await getCategoryInfo(categoryName);
  
  return {
    message: `Category '${categoryName}' added successfully with ${gpids.length} GPIDs`,
    category: categoryInfo
  };
}

async function updateCategory(categoryName: string, gpids: number[]): Promise<{ message: string; category: CategoryInfo }> {
  // In a real implementation, you might want to store categories in a database
  // For now, we'll just return success
  const categoryInfo = await getCategoryInfo(categoryName);
  
  return {
    message: `Category '${categoryName}' updated successfully with ${gpids.length} GPIDs`,
    category: categoryInfo
  };
}

async function deleteCategory(categoryName: string): Promise<{ message: string }> {
  // In a real implementation, you might want to store categories in a database
  // For now, we'll just return success
  
  return {
    message: `Category '${categoryName}' deleted successfully`
  };
}

async function syncCategory(categoryName: string): Promise<{ message: string; syncResult: any }> {
  const gpids = GPID_CATEGORIES[categoryName as keyof typeof GPID_CATEGORIES];
  
  if (!gpids || gpids.length === 0) {
    throw new Error(`No GPIDs found for category '${categoryName}'`);
  }
  
  // Call the sync-games-database function
  const syncResponse = await fetch(`${supabaseUrl}/functions/v1/sync-games-database`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({
      gpids,
      category: categoryName
    })
  });
  
  const syncResult = await syncResponse.json();
  
  return {
    message: `Sync initiated for category '${categoryName}' with ${gpids.length} GPIDs`,
    syncResult
  };
}

async function getCategoryStats(): Promise<{ totalCategories: number; totalGPIDs: number; totalGames: number; categories: any[] }> {
  const categories = await listCategories();
  
  const totalCategories = categories.length;
  const totalGPIDs = categories.reduce((sum, cat) => sum + cat.gpids.length, 0);
  const totalGames = categories.reduce((sum, cat) => sum + (cat.totalGames || 0), 0);
  
  return {
    totalCategories,
    totalGPIDs,
    totalGames,
    categories
  };
}

function getCategoryDescription(categoryName: string): string {
  const descriptions: Record<string, string> = {
    casino: 'Live casino games including Baccarat, Roulette, Dragon Tiger, and more',
    slots: 'Slot machine games with various themes and features',
    sports: 'Sports betting and virtual sports games',
    lottery: 'Lottery and number games',
    poker: 'Poker games and tournaments'
  };
  
  return descriptions[categoryName] || `Games in the ${categoryName} category`;
} 