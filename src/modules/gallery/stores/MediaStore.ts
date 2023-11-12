import {defineStore} from "pinia";
import type {Media} from "@/modules/gallery/GalleryEntities";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import {useToast} from "vuestic-ui";
import type {TransformOptions} from "@supabase/storage-js/src/lib/types";

export const useMediaStore = defineStore('media-store', () => {
    const {init} = useToast();

    async function createSignedUrlForMedia(media: Media, options: { download?: string | boolean; transform?: TransformOptions }): Promise<string> {
        const {data, error} = await supabasePort.storage
            .from('medias')
            .createSignedUrl(media.storage_path, 1800, options)

        if (error || !data) {
            init({
                message: `Failed to generate signed URL for ${media.storage_path}`,
                color: 'danger'
            });

            return '';
        }

        return data.signedUrl
    }

    async function createThumbnailUrlForMedia(media: Media): Promise<string> {
        return createSignedUrlForMedia(media, {
            transform: {
                width: 100,
                height: 100
            }
        })
    }

    async function createFullSizeViewUrlForMedia(media: Media): Promise<string> {
        return createSignedUrlForMedia(media, {})
    }

    async function getMediaById(id: string): Promise<Media | null> {
        const {data, error} = await supabasePort.from('medias')
            .select()
            .limit(1)
            .eq('id', id)

        if (error || !data) {
            init({
                message: `Failed to fetch media with id ${id}`,
                color: 'danger'
            })
            return null;
        }

        if (!data[0]) {
            init({
                message: `Media with id ${id} not found`,
                color: 'danger'
            })
            return null;
        }

        return data[0];
    }

    return {
        createThumbnailUrlForMedia,
        createFullSizeViewUrlForMedia,
        getMediaById
    }
})