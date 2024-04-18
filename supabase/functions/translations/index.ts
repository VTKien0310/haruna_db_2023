import {Responder} from "../_shared/responder.ts";
import provider from "../_shared/provider.ts";

Deno.serve(async (req) => {
    const responder: Responder = provider.responder()

    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === 'OPTIONS') {
        return responder.responseCors()
    }

    const {original_content, source_lang, target_lang} = await req.json()

    if (!original_content) {
        return responder.responseBadRequest('missing_original_content', 'Original content is required.')
    }

    const supportedLang: string[] = ['JA', 'EN']

    if (!supportedLang.includes(source_lang)) {
        return responder.responseBadRequest('source_lang_not_supported', `Source lang ${source_lang} is not supported.`)
    }

    if (!supportedLang.includes(target_lang)) {
        return responder.responseBadRequest('target_lang_not_supported', `Target lang ${target_lang} is not supported.`)
    }

    if (source_lang === target_lang) {
        return responder.responseBadRequest('duplicate_source_lang', 'Source lang must be different from target lang.')
    }

    const deepLApiKey = Deno.env.get('DEEPL_API_KEY')
    const deepLTranslationEndpoint = Deno.env.get('DEEPL_API_ENDPOINT')
    const translationResponse: Response = await fetch(deepLTranslationEndpoint, {
        method: "POST",
        headers: {
            "Authorization": `DeepL-Auth-Key ${deepLApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text: [original_content],
            target_lang: target_lang,
            source_lang: source_lang,
        })
    })

    const translatedContent: string = (await translationResponse.json()).translations[0].text

    return responder.responseSuccess({
        translated_content: translatedContent,
    })
})
