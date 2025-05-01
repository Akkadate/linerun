// src/config.js
const config = {
  liffId: process.env.REACT_APP_LIFF_ID,
  apiUrl: process.env.REACT_APP_API_URL,
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
};

console.log('API URL:', config.apiUrl);
export default config;
