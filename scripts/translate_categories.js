import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    envVars[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORY_MAP = {
  'mens': 'hombres',
  'womens': 'mujeres',
  'kids': 'ninos',
};

async function migrateCategories() {
  console.log("Fetching products to translate categories...");
  const { data: products, error } = await supabase.from('products').select('id, category, colors, sizes, badges');
  
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }
  
  let updatedCount = 0;
  for (const product of products) {
    const updates = {};
    if (product.category && CATEGORY_MAP[product.category.toLowerCase()]) {
       updates.category = CATEGORY_MAP[product.category.toLowerCase()];
    }
    
    // Check badges
    if (product.badges && product.badges.length > 0) {
       let updatedBadges = false;
       const newBadges = product.badges.map(b => {
          const lTag = b.toLowerCase();
          if (lTag === 'new' || lTag === 'new arrival') { updatedBadges = true; return 'Nuevo'; }
          else if (lTag === 'sale') { updatedBadges = true; return 'Oferta'; }
          else if (lTag === 'bestseller' || lTag === 'best seller') { updatedBadges = true; return 'Más Vendido'; }
          return b;
       });
       if (updatedBadges) updates.badges = newBadges;
    }
    
    // Check colors
    const COLOR_MAP = {
      'black': 'negro',
      'white': 'blanco',
      'red': 'rojo',
      'blue': 'azul',
      'green': 'verde',
      'yellow': 'amarillo',
      'orange': 'naranja',
      'pink': 'rosa',
      'purple': 'violeta',
      'gray': 'gris',
      'grey': 'gris',
      'brown': 'marrón',
      'navy': 'marino',
      'olive': 'oliva',
      'beige': 'beige'
    };
    if (product.colors && product.colors.length > 0) {
       let updatedColors = false;
       const newColors = product.colors.map(c => {
          const lowerC = c.toLowerCase();
          if (COLOR_MAP[lowerC]) {
             updatedColors = true;
             return COLOR_MAP[lowerC];
          }
          return c;
       });
       if (updatedColors) updates.colors = newColors;
    }
    
    if (Object.keys(updates).length > 0) {
      console.log(`Updating product ${product.id}:`, updates);
      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`Category & color migration complete. Updated ${updatedCount} products.`);
}

migrateCategories();
