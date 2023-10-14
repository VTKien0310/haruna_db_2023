import {defineStore} from "pinia";
import {defaultStorageFileOptions, supabasePort} from "@/ports/supabase/SupabasePort";
import {useToast} from "vuestic-ui";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";

export const useGalleryStore = defineStore('gallery', () => {
    const {init} = useToast();

    function getFileExtension(file: File): string {
        return file.type.split('/').at(-1) ?? '';
    }

    function generateFileStorageName(fileExtension: string): string {
        const uniqueFileName: string = uuid();
        return fileExtension
            ? `${uniqueFileName}.${fileExtension}`
            : uniqueFileName;
    }

    async function uploadMedia(file: File): Promise<boolean> {
        const fileExtension: string = getFileExtension(file);
        const fileStorageName: string = generateFileStorageName(fileExtension);

        const {data, error} = await supabasePort.storage
            .from('medias')
            .upload(fileStorageName, file, defaultStorageFileOptions)

        if (error || !data?.path) {
            init({
                message: `Failed to upload ${file.name}`,
                color: 'danger'
            });

            return false;
        }

        return await createMediaRecord(data.path, file);
    }

    async function createMediaRecord(storageFilePath: string, originalFile: File): Promise<boolean> {
        const {error} = await supabasePort
            .from('medias')
            .insert({
                name: originalFile.name,
                mime: originalFile.type,
                size: originalFile.size,
                type: 0,
                storage_path: storageFilePath
            })

        if (error) {
            init({
                message: `Failed to create record for ${originalFile.name}`,
                color: 'danger'
            });

            return false;
        }

        return true;
    }

    return {
        uploadMedia,
    }
})