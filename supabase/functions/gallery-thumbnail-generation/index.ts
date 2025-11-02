import { createClient } from "jsr:@supabase/supabase-js@2";
import { Responder } from "../_shared/responder.ts";
import provider from "../_shared/provider.ts";
import { Image } from "jsr:@matmen/imagescript";

interface ResizeRequest {
  original_bucket: string;
  original_path: string;
  original_id: string;
  width: number;
  height: number;
}

Deno.serve(async (req) => {
  const responder: Responder = provider.responder();

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return responder.responseCors();
  }

  try {
    const {
      original_bucket,
      original_path,
      original_id,
      width,
      height,
    }: ResizeRequest = await req.json();

    if (
      !original_bucket ||
      !original_path ||
      !original_id ||
      !width ||
      !height
    ) {
      return responder.responseMissingParameters();
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: ogImage, error: downloadOgImageError } =
      await supabaseAdmin.storage.from(original_bucket).download(original_path);

    if (downloadOgImageError) {
      throw new Error(
        `Failed to download original image: ${downloadOgImageError.message}`,
      );
    }

    const arrayBuffer = await ogImage.arrayBuffer();

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
