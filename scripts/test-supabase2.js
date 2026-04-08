import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Fetching properties...");
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      amenities (*),
      property_images (*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! Properties count:", data?.length);
    if (data?.length === 0) {
      console.log("Table is empty.");
    }
  }
}
test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
