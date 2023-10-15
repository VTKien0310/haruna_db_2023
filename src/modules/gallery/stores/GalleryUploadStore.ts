import {defineStore} from "pinia";
import {defaultStorageFileOptions, supabasePort} from "@/ports/supabase/SupabasePort";
import {useModal, useToast} from "vuestic-ui";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {ref} from "vue";
import router from "@/router";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";
import {MediaTypeEnum} from "@/modules/gallery/GalleryEntities";

export const useGalleryUploadStore = defineStore('gallery-upload', () => {
    const pendingNewMediaFiles = ref<File[]>([])

    const {confirm} = useModal();

    function uploadPendingNewMediaFiles(): void {
        confirm(`Proceed to upload ${pendingNewMediaFiles.value.length} file(s)?`).then(
            async (confirmToProceed: boolean): Promise<void> => {
                if (!confirmToProceed) {
                    return;
                }

                turnOnIsHandlingCreateNewMediaState();
                pendingNewMediaFiles.value = await handleUploadNewMediaFiles();
                turnOffIsHandlingCreateNewMediaState();
                redirectToGalleryListIfHasNoUploadError();
            }
        )
    }

    async function handleUploadNewMediaFiles(): Promise<File[]> {
        const failedToUploadFiles: File[] = [];

        for (const file of pendingNewMediaFiles.value) {
            const fileUploadSuccessfully: boolean = await uploadMedia(file);
            if (!fileUploadSuccessfully) {
                failedToUploadFiles.push(file)
            }
        }

        return failedToUploadFiles;
    }

    const {init} = useToast();

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
                type: MediaTypeEnum.PHOTO,
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

    const isHandlingCreateNewMedia = ref<boolean>(false)

    function turnOnIsHandlingCreateNewMediaState(): void {
        isHandlingCreateNewMedia.value = true;
    }

    function turnOffIsHandlingCreateNewMediaState(): void {
        isHandlingCreateNewMedia.value = false;
    }

    function redirectToGalleryListIfHasNoUploadError(): void {
        if (pendingNewMediaFiles.value.length === 0) {
            router.push({
                name: GalleryRouteName.LIST
            })
        }
    }

    function getFileExtension(file: File): string {
        return file.type.split('/').at(-1) ?? '';
    }

    function generateFileStorageName(fileExtension: string): string {
        const uniqueFileName: string = uuid();
        return fileExtension
            ? `${uniqueFileName}.${fileExtension}`
            : uniqueFileName;
    }

    function reset(): void {
        pendingNewMediaFiles.value = [];
        turnOffIsHandlingCreateNewMediaState();
    }

    return {
        pendingNewMediaFiles,
        uploadPendingNewMediaFiles,
        isHandlingCreateNewMedia,
        reset
    }
})