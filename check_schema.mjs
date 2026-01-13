import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const tables = ['services', 'subscriptions', 'payments'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table: ${table}`);
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log('No data or error:', error);
    }
  }
}
check();
