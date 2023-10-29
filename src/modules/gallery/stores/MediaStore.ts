import {defineStore} from "pinia";
import type {Media} from "@/modules/gallery/GalleryEntities";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import {useToast} from "vuestic-ui";

export const useMediaStore = defineStore('media-store', () => {
    const {init} = useToast();

    async function createSignedUrlForMedia(media: Media): Promise<string> {
        const {data, error} = await supabasePort.storage
            .from('medias')
            .createSignedUrl(media.storage_path, 1800, {
                transform: {
                    width: 100,
                    height: 100
                }
            })

        if (error || !data) {
            init({
                message: `Failed to generate signed URL for ${media.storage_path}`,
                color: 'danger'
            });

            return '';
        }

        return data.signedUrl
    }

    return {
        createSignedUrlForMedia
    }
})