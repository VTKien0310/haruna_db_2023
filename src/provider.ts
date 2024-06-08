import {TranslationService} from "@/modules/translation/TranslationService";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import {GalleryListService} from "@/modules/gallery/services/GalleryListService";

class Provider {
    translationService(): TranslationService {
        return new TranslationService(supabasePort)
    }

    galleryListService(): GalleryListService {
        return new GalleryListService();
    }
}

const provider: Provider = new Provider()

export default provider