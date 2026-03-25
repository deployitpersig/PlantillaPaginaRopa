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

const MAP = {
  'T-Shirts': 'Remeras',
  'Polo Shirts': 'Chombas',
  'Hoodies': 'Buzos',
  'Jackets': 'Camperas',
  'Jeans': 'Jeans',
  'Pants': 'Pantalones',
  'Shorts': 'Shorts',
  'Suits': 'Trajes',
  'Swimwear': 'Trajes de Baño',
  'Socks': 'Medias',
  'Accessories': 'Accesorios',
  
  'Tops': 'Tops',
  'Blouses': 'Blusas',
  'Dresses': 'Vestidos',
  'Skirts': 'Faldas',
  'Underwear': 'Ropa Interior',
  'Jumpsuits': 'Monos',
  'Socks & Tights': 'Medias y Pantimedias',
  
  'Shirts': 'Camisas',
  'Pants & Leggings': 'Pantalones y Leggings'
};

async function migrateSubcategories() {
  console.log("Fetching products...");
  const { data: products, error } = await supabase.from('products').select('id, subcategory');
  
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }
  
  console.log(`Found ${products.length} products. Translating subcategories...`);
  
  let updatedCount = 0;
  for (const product of products) {
    if (product.subcategory && MAP[product.subcategory]) {
      const newSubcategory = MAP[product.subcategory];
      console.log(`Updating product ${product.id}: ${product.subcategory} -> ${newSubcategory}`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ subcategory: newSubcategory })
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`Migration complete. Updated ${updatedCount} products.`);
}

migrateSubcategories();
