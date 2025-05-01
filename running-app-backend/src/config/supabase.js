// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with the database
const supabase = createClient(supabaseUrl, supabaseKey);

// เพิ่มการตรวจสอบการเชื่อมต่อ Supabase ในไฟล์ src/config/supabase.js
try {
  // ทดสอบการเชื่อมต่อ
  const { data, error } = await supabase.from('users').select('count(*)');
  console.log('Supabase connection test:', data, error);
} catch (err) {
  console.error('Supabase connection error:', err);
}

// ใน src/config/supabase.js หลังจากสร้าง supabase client
console.log('Supabase URL:', supabaseUrl);
console.log('Testing Supabase connection...');

// ทดสอบการเชื่อมต่อ
supabase.from('users').select('count(*)', { count: 'exact' })
  .then(({ data, error, count }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful, user count:', count);
    }
  })
  .catch(err => {
    console.error('Supabase test query error:', err);
  });

export default supabase;
