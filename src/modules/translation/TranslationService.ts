import type {SupabaseClient} from "@supabase/supabase-js";
import {LanguageCode} from "@/modules/translation/TranslationTypes.ts";
import {useToast} from "vuestic-ui";

export class TranslationService {
    constructor(private readonly supabasePort: SupabaseClient) {
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
            const {init} = useToast();
            init({message: 'Failed to translate content', color: 'danger'})

            return '';
        }

        return data.data.translated_content
    }
}