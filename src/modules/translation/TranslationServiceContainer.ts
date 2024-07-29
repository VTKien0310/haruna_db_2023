import { TranslationService } from "@/modules/translation/TranslationService";
import { supabasePort } from "@/ports/supabase/SupabasePort";

const useTranslationService = () => new TranslationService(supabasePort);

export { useTranslationService };
