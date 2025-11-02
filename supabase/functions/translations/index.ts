import { Responder } from "../_shared/responder.ts";
import provider from "../_shared/provider.ts";

interface TranslationRequest {
  original_content: string;
  source_lang: string;
  target_lang: string;
}

Deno.serve(async (req) => {
  const responder: Responder = provider.responder();

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return responder.responseCors();
  }

  try {
    const { original_content, source_lang, target_lang }: TranslationRequest =
      await req.json();

    if (!original_content || !source_lang || !target_lang) {
      return responder.responseMissingParameters();
    }

    const supportedLang: string[] = ["JA", "EN"];

    if (!supportedLang.includes(source_lang)) {
      return responder.responseValidationFailed(
        `Source lang ${source_lang} is not supported.`,
      );
    }

    if (!supportedLang.includes(target_lang)) {
      return responder.responseValidationFailed(
        `Target lang ${target_lang} is not supported.`,
      );
    }

    if (source_lang === target_lang) {
      return responder.responseValidationFailed(
        "Source lang must be different from target lang.",
      );
    }

    const deepLApiKey = Deno.env.get("DEEPL_API_KEY");
    const deepLTranslationEndpoint = Deno.env.get("DEEPL_API_ENDPOINT");
    const translationResponse: Response = await fetch(
      deepLTranslationEndpoint,
      {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${deepLApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [original_content],
          target_lang: target_lang,
          source_lang: source_lang,
        }),
      },
    );

    const translatedContent: string = (await translationResponse.json())
      .translations[0].text;

    return responder.responseSuccess({
      translated_content: translatedContent,
    });
  } catch (e) {
    return responder.responseInternalError(e.message);
  }
});
