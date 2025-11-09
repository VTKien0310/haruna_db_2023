import { createClient } from "jsr:@supabase/supabase-js@2";
import { Responder } from "../_shared/responder.ts";
import provider from "../_shared/provider.ts";
import { Image } from "jsr:@matmen/imagescript";

Deno.serve(async (req) => {
  const responder: Responder = provider.responder();

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return responder.responseCors();
  }

  if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
    return responder.responseAllowMultipartFormDataOnly();
  }

  try {
    const formData = await req.formData();

    if (
      !formData.get("original_id") ||
      !formData.get("original_image") ||
      !formData.get("width") ||
      !formData.get("height")
    ) {
      return responder.responseMissingParameters();
    }

    const original_id: string = formData.get("original_id");
    const original_image: Blob = formData.get("original_image");
    const width: number = formData.get("width");
    const height: number = formData.get("height");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const arrayBuffer = await original_image.arrayBuffer();

    const image = await Image.decode(new Uint8Array(arrayBuffer));
    const resizedImage = image.cover(width, height);
    const resizedBuffer = await resizedImage.encodeJPEG(75);

    const storageBucket = "resized";
    const storagePath = `${original_id}/${width}x${height}.jpeg`;
    const { error: saveGeneratedImageError } = await supabaseAdmin.storage
      .from(storageBucket)
      .upload(storagePath, resizedBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (saveGeneratedImageError) {
      throw new Error(
        `Failed to save generated image: ${saveGeneratedImageError.message}`,
      );
    }

    return responder.responseSuccess({
      bucket: storageBucket,
      path: storagePath,
    });
  } catch (error) {
    return responder.responseInternalError(error.message);
  }
});
