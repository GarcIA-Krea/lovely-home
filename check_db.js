const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '.env.local') });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

supabase.from("properties").select("id, name, slug").then(res => {
  console.log(JSON.stringify(res, null, 2));
});
