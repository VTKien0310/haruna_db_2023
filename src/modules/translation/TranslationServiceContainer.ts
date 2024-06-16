import { TranslationService } from "@/modules/translation/TranslationService";
import { supabasePort } from "@/ports/supabase/SupabasePort";

export class TranslationServiceContainer {
  translationService(): TranslationService {
    return new TranslationService(supabasePort);
  }
}

const translationServiceContainer: TranslationServiceContainer =
  new TranslationServiceContainer();

export default translationServiceContainer;
