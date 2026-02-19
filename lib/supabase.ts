import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvpozoconmjpaztlpmyn.supabase.co';
const supabaseKey = 'sb_publishable_vRFikSKGyAKV7cIExgbvzw_EbF26oeg';

export const supabase = createClient(supabaseUrl, supabaseKey);
