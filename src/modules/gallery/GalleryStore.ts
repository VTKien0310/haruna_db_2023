import {defineStore} from "pinia";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import {useToast} from "vuestic-ui";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";

export const useGalleryStore = defineStore('gallery', () => {
    const {init} = useToast();

    async function uploadMedia(file: File): Promise<string | null> {
        const fileExtension: string = file.type.split('/').at(-1) ?? '';
        const fileStorageName: string = fileExtension ? uuid() + '.' + fileExtension : uuid();

        const {data, error} = await supabasePort.storage
            .from('medias')
            .upload(fileStorageName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            init('Failed to upload');

            return null;
        }

        return data?.path;
    }
})