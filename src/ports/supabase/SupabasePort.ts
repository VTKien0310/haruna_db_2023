import {createClient, SupabaseClient} from '@supabase/supabase-js';
import type {FileOptions} from "@supabase/storage-js/src/lib/types";

const supabaseApiUrl: string = import.meta.env.VITE_SUPABASE_API_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabasePort: SupabaseClient = createClient(
    supabaseApiUrl,
    supabaseAnonKey,
);

export const defaultStorageFileOptions: FileOptions = {
    cacheControl: '3600',
    upsert: false
}