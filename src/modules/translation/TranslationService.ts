import type {SupabaseClient} from "@supabase/supabase-js";
import {LanguageCode} from "@/modules/translation/TranslationTypes";
import type {ToastService} from '@/modules/master/services/ToastService';

export class TranslationService {
    constructor(
        private readonly supabasePort: SupabaseClient,
        private readonly toastService: ToastService,
    ) {
    }

    public async translate(originalContent: string, sourceLang: LanguageCode): Promise<string> {
        const targetLang: LanguageCode = sourceLang === LanguageCode.JA
            ? LanguageCode.EN
            : LanguageCode.JA;

        const {data, error} = await this.supabasePort.functions.invoke('translations', {
            body: {
                original_content: originalContent,
                source_lang: sourceLang,
                target_lang: targetLang
            },
        })

        if (error || !data?.success || !data?.data?.translated_content) {
            this.toastService.error('Failed to translate content')

            return '';
        }

        return data.data.translated_content
    }
}
