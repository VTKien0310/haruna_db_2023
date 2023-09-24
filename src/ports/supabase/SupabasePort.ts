import {createClient, SupabaseClient} from '@supabase/supabase-js';

const supabaseApiUrl: string = import.meta.env.VITE_SUPABASE_API_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabasePort: SupabaseClient = createClient(
    supabaseApiUrl,
    supabaseAnonKey,
);