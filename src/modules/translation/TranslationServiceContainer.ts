import { TranslationService } from "@/modules/translation/TranslationService";
import { supabasePort } from "@/ports/supabase/SupabasePort";
import {useToastService} from '@/modules/master/MasterServiceContainer';

const useTranslationService = () => new TranslationService(
    supabasePort,
    useToastService()
);

export { useTranslationService };
