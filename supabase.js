const SUPABASE_URL = "https://bwqqcbocgqgvjqyzcdrv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cXFjYm9jZ3FndmpxeXpjZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Mjk4OTEsImV4cCI6MjA5MTIwNTg5MX0.T5LZCdR88Bw56ej4I6wMh5NFBM-CWoO6y899DK07sAM";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function saveOrder(orderData) {
  const { data, error } = await sb.from('orders').insert([orderData]).select();
  if (error) throw error;
  return data[0];
}

async function getMenu(kantinId) {
  const { data, error } = await sb.from('menu').select('*').eq('kantin_id', kantinId);
  if (error) return [];
  return data;
}