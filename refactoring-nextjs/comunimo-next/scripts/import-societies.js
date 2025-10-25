/**
 * Script to import societies from societies_import.json to Supabase
 * Run with: node scripts/import-societies.js
 */

const fs = require('fs');
const path = require('path');

// Read societies data
const societiesPath = path.join(__dirname, '..', 'societies_import.json');
const societies = JSON.parse(fs.readFileSync(societiesPath, 'utf8'));

console.log(`📊 Total societies to import: ${societies.length}`);

// Supabase configuration
const SUPABASE_URL = 'https://rlhzsztbkfjpryhlojee.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable not set');
  process.exit(1);
}

async function importSocieties() {
  const batchSize = 100;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < societies.length; i += batchSize) {
    const batch = societies.slice(i, i + batchSize);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/all_societies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(batch)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Batch ${i / batchSize + 1} failed:`, error);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Batch ${i / batchSize + 1} imported: ${batch.length} societies (Total: ${imported}/${societies.length})`);
      }
    } catch (error) {
      console.error(`❌ Batch ${i / batchSize + 1} error:`, error.message);
      errors += batch.length;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Imported: ${imported}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📈 Total: ${societies.length}`);
}

importSocieties().catch(console.error);

