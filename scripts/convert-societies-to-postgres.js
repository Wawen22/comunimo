/**
 * Convert tab_societa.sql (MySQL) to PostgreSQL INSERT statements
 * for all_societies table
 * 
 * Splits into multiple files (500 societies each) to avoid query size limits
 */

const fs = require('fs');
const path = require('path');

// Read the MySQL SQL file
const sqlFile = path.join(__dirname, '..', 'tab_societa.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Extract all INSERT statements
const insertRegex = /INSERT INTO `tab_societa`[^;]+;/gs;
const inserts = sqlContent.match(insertRegex);

if (!inserts) {
  console.error('❌ No INSERT statements found!');
  process.exit(1);
}

console.log(`📊 Found ${inserts.length} INSERT statements`);

// Parse all societies from all INSERT statements
const societies = [];

inserts.forEach((insertStmt) => {
  // Extract VALUES part
  const valuesMatch = insertStmt.match(/VALUES\s+([\s\S]+);/);
  if (!valuesMatch) return;

  const valuesStr = valuesMatch[1];
  
  // Split by "),(" to get individual rows
  const rows = valuesStr.split(/\),\s*\(/);
  
  rows.forEach((row, index) => {
    // Clean up the row
    let cleanRow = row.trim();
    if (index === 0) cleanRow = cleanRow.replace(/^\(/, ''); // Remove leading (
    if (index === rows.length - 1) cleanRow = cleanRow.replace(/\)$/, ''); // Remove trailing )
    
    // Parse the values
    const values = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < cleanRow.length; i++) {
      const char = cleanRow[i];
      
      if (char === "'" && (i === 0 || cleanRow[i - 1] !== '\\')) {
        inQuote = !inQuote;
        current += char;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) values.push(current.trim());
    
    if (values.length >= 4) {
      // Remove quotes and escape single quotes for PostgreSQL
      const cleanValue = (val) => {
        if (!val || val === 'NULL') return null;
        let cleaned = val.replace(/^'|'$/g, ''); // Remove outer quotes
        cleaned = cleaned.replace(/''/g, "'"); // MySQL double quotes to single
        return cleaned;
      };
      
      const society = {
        society_code: cleanValue(values[0]),
        name: cleanValue(values[1]),
        province: cleanValue(values[2]),
        organization: cleanValue(values[3]),
        is_managed: values[4] ? cleanValue(values[4]) === 'S' : false,
      };
      
      // Validate
      if (society.society_code && society.name) {
        societies.push(society);
      }
    }
  });
});

console.log(`✅ Parsed ${societies.length} societies`);

// Split into batches of 500
const BATCH_SIZE = 500;
const batches = [];

for (let i = 0; i < societies.length; i += BATCH_SIZE) {
  batches.push(societies.slice(i, i + BATCH_SIZE));
}

console.log(`📦 Split into ${batches.length} batches of max ${BATCH_SIZE} societies`);

// Create output directory
const outputDir = path.join(__dirname, '..', 'supabase', 'migrations');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate PostgreSQL INSERT statements for each batch
batches.forEach((batch, batchIndex) => {
  const batchNumber = batchIndex + 1;
  const fileName = `20251025_import_all_societies_batch_${batchNumber}.sql`;
  const filePath = path.join(outputDir, fileName);
  
  let sql = `-- Import all_societies - Batch ${batchNumber}/${batches.length}\n`;
  sql += `-- Societies: ${batch.length}\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n\n`;
  
  sql += `-- Insert societies (ON CONFLICT DO NOTHING to avoid duplicates)\n`;
  sql += `INSERT INTO public.all_societies (society_code, name, province, organization, is_managed)\n`;
  sql += `VALUES\n`;

  const values = batch.map((society, index) => {
    const code = society.society_code.replace(/'/g, "''");
    const name = society.name.replace(/'/g, "''");
    const province = society.province ? `'${society.province.replace(/'/g, "''")}'` : 'NULL';
    const organization = society.organization ? `'${society.organization.replace(/'/g, "''")}'` : 'NULL';
    const isManaged = society.is_managed ? 'true' : 'false';

    const comma = index < batch.length - 1 ? ',' : '';
    return `  ('${code}', '${name}', ${province}, ${organization}, ${isManaged})${comma}`;
  });

  sql += values.join('\n');
  sql += '\n';
  sql += `ON CONFLICT (society_code) DO NOTHING;\n\n`;
  
  sql += `-- Add ON CONFLICT clause\n`;
  sql += `-- If you want to update existing records instead, replace the above with:\n`;
  sql += `-- INSERT INTO public.all_societies (society_code, name, province, organization, is_managed)\n`;
  sql += `-- VALUES ... (same as above)\n`;
  sql += `-- ON CONFLICT (society_code) DO UPDATE SET\n`;
  sql += `--   name = EXCLUDED.name,\n`;
  sql += `--   province = EXCLUDED.province,\n`;
  sql += `--   organization = EXCLUDED.organization,\n`;
  sql += `--   is_managed = EXCLUDED.is_managed,\n`;
  sql += `--   updated_at = NOW();\n`;
  
  fs.writeFileSync(filePath, sql, 'utf8');
  console.log(`✅ Created ${fileName} (${batch.length} societies)`);
});

// Create a master file that runs all batches
const masterFileName = '20251025_import_all_societies_MASTER.sql';
const masterFilePath = path.join(outputDir, masterFileName);

let masterSql = `-- Import all_societies - MASTER FILE\n`;
masterSql += `-- Total societies: ${societies.length}\n`;
masterSql += `-- Batches: ${batches.length}\n`;
masterSql += `-- Generated: ${new Date().toISOString()}\n\n`;

masterSql += `-- This file imports all societies in batches\n`;
masterSql += `-- You can run this file directly in Supabase SQL Editor\n\n`;

batches.forEach((batch, batchIndex) => {
  const batchNumber = batchIndex + 1;
  masterSql += `-- Batch ${batchNumber}/${batches.length} (${batch.length} societies)\n`;
  masterSql += `\\i 20251025_import_all_societies_batch_${batchNumber}.sql\n\n`;
});

fs.writeFileSync(masterFilePath, masterSql, 'utf8');
console.log(`✅ Created ${masterFileName} (master file)`);

// Create summary
console.log('\n📊 Summary:');
console.log(`   Total societies: ${societies.length}`);
console.log(`   Batches created: ${batches.length}`);
console.log(`   Batch size: ${BATCH_SIZE}`);
console.log(`   Output directory: ${outputDir}`);
console.log('\n🚀 Next steps:');
console.log('   1. Go to Supabase SQL Editor');
console.log('   2. Copy and paste each batch file content');
console.log('   3. Run each batch sequentially');
console.log('   OR');
console.log('   1. Copy the content of each batch file');
console.log('   2. Run in Supabase SQL Editor one by one');

// Create a single combined file for convenience (if not too large)
if (societies.length <= 2000) {
  const combinedFileName = '20251025_import_all_societies_COMBINED.sql';
  const combinedFilePath = path.join(outputDir, combinedFileName);
  
  let combinedSql = `-- Import all_societies - COMBINED FILE\n`;
  combinedSql += `-- Total societies: ${societies.length}\n`;
  combinedSql += `-- Generated: ${new Date().toISOString()}\n\n`;
  
  combinedSql += `-- Insert all societies at once\n`;
  combinedSql += `INSERT INTO public.all_societies (society_code, name, province, organization, is_managed)\n`;
  combinedSql += `VALUES\n`;

  const allValues = societies.map((society, index) => {
    const code = society.society_code.replace(/'/g, "''");
    const name = society.name.replace(/'/g, "''");
    const province = society.province ? `'${society.province.replace(/'/g, "''")}'` : 'NULL';
    const organization = society.organization ? `'${society.organization.replace(/'/g, "''")}'` : 'NULL';
    const isManaged = society.is_managed ? 'true' : 'false';

    const comma = index < societies.length - 1 ? ',' : '';
    return `  ('${code}', '${name}', ${province}, ${organization}, ${isManaged})${comma}`;
  });

  combinedSql += allValues.join('\n');
  combinedSql += '\n';
  combinedSql += `ON CONFLICT (society_code) DO NOTHING;\n`;
  
  fs.writeFileSync(combinedFilePath, combinedSql, 'utf8');
  console.log(`\n✅ Also created ${combinedFileName} (all societies in one file)`);
  console.log('   ⚠️  This file might be too large for Supabase SQL Editor');
  console.log('   ⚠️  Use batch files if you encounter size limits');
}

