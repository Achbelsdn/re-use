const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDB() {
  console.log('Testing Supabase Connection...');
  
  // 1. Check if the table exists by trying to select from it
  const { data, error } = await supabase.from('components').select('id').limit(1);
  if (error) {
    console.error('❌ Table error:', error.message);
  } else {
    console.log('✅ Table "components" exists!');
  }

  // 3. Fetch components
  const { data: components, error: compError } = await supabase.from('components').select('*');
  if (compError) {
    console.error('❌ Fetch error:', compError.message);
  } else {
    console.log(`📊 Found ${components.length} components in the database.`);
    if (components.length > 0) {
      console.log('Last component:', components[components.length - 1].title);
    }
  }
}

testDB();
