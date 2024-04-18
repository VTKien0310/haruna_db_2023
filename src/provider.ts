import {TranslationService} from "@/modules/translation/TranslationService.ts";
import {supabasePort} from "@/ports/supabase/SupabasePort.ts";

class Provider {
    translationService(): TranslationService {
        return new TranslationService(supabasePort)
    }
}

const provider: Provider = new Provider()

export default provider