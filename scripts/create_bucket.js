import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Creating bucket: property-photos...');
  const { data, error } = await supabase.storage.createBucket('property-photos', {
    public: true,
    fileSizeLimit: 10485760 // 10MB
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket already exists.');
    } else {
      console.error('Error creating bucket:', error.message);
    }
  } else {
    console.log('Bucket created successfully!', data);
  }
}
run();
