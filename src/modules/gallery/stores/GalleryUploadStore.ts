import {defineStore} from "pinia";
import {defaultStorageFileOptions, supabasePort} from "@/ports/supabase/SupabasePort";
import {useModal, useToast} from "vuestic-ui";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import {ref} from "vue";
import router from "@/router";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";
import {MediaTypeEnum} from "@/modules/gallery/GalleryEntities";
import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import type {FileData} from "@ffmpeg/ffmpeg/dist/esm/types";

export const useGalleryUploadStore = defineStore('gallery-upload', () => {
    const pendingNewMediaFiles = ref<File[]>([])

    const isImageUploadMode = ref<boolean>(true);

    const {confirm} = useModal();

    const galleryListStore = useGalleryListStore();

    function getFileType(file: File): string {
        return file.type.split('/')[0] ?? '';
    }

    const imageFileType: string = 'image';
    const videoFileType: string = 'video';

    function isValidFileForUpload(file: File): boolean {
        return [
            imageFileType,
            videoFileType,
        ].includes(getFileType(file));
    }

    function filterPendingFilesForValidForUpload(): void {
        pendingNewMediaFiles.value = pendingNewMediaFiles.value.filter(isValidFileForUpload)
    }

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
                galleryListStore.refreshMedias();
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

    function toastFailedToCreateMediaRecord(originalFile: File): boolean {
        init({
            message: `Failed to create record for ${originalFile.name}`,
            color: 'danger'
        });

        return false;
    }

    async function generateThumbnailForVideo(storageVideoFilePath: string, video: File): Promise<string> {
        const {data, error} = await supabasePort.storage
            .from('medias')
            .createSignedUrl(storageVideoFilePath, 300)

        if (error || !data) {
            init({
                message: `Failed to generate signed URL for ${storageVideoFilePath} to create thumbnail`,
                color: 'danger'
            });

            return '';
        }

        try {
            /* Load ffmpeg wasm  */
            const ffmpeg: FFmpeg = new FFmpeg();
            const ffmpegWasmCdnBaseURL: string = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
            // toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
            await ffmpeg.load({
                coreURL: await toBlobURL(`${ffmpegWasmCdnBaseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${ffmpegWasmCdnBaseURL}/ffmpeg-core.wasm`, 'application/wasm')
            });

            const storageFileName: string = storageVideoFilePath.split('/').at(-1)!.split('.').at(0)!;
            const thumbnailFileName: string = `${storageFileName}_thumb.png`;

            /* Create video thumbnail using the frame at 1s of the video  */
            await ffmpeg.writeFile(video.name, await fetchFile(data.signedUrl));
            await ffmpeg.exec(['-i', video.name, '-ss', '00:00:01', '-frames:v', '1', thumbnailFileName]);
            const thumbnail: FileData = await ffmpeg.readFile(thumbnailFileName);

            return await storeVideoThumbnail(thumbnail, thumbnailFileName);
        } catch (e: unknown) {
            init({
                message: `Failed to create thumbnail for ${video.name}`,
                color: 'danger'
            });

            return '';
        }
    }

    async function storeVideoThumbnail(thumbnail: FileData, thumbnailFileName: string): Promise<string> {
        const {data, error} = await supabasePort.storage
            .from('thumbnails')
            .upload(thumbnailFileName, new Blob([thumbnail.buffer], {type: 'image/png'}), defaultStorageFileOptions)

        if (error || !data?.path) {
            init({
                message: `Failed to upload thumbnail ${thumbnailFileName}`,
                color: 'danger'
            });

            return '';
        }

        return data.path;
    }

    async function createPhotoMediaRecord(storageFilePath: string, originalFile: File): Promise<boolean> {
        const {error} = await supabasePort
            .from('medias')
            .insert({
                name: originalFile.name,
                mime: originalFile.type,
                size: originalFile.size,
                type: MediaTypeEnum.PHOTO,
                storage_path: storageFilePath,
                thumbnail_path: null
            });

        if (error) {
            return toastFailedToCreateMediaRecord(originalFile);
        }

        return true;
    }

    async function createVideoMediaRecord(storageFilePath: string, originalFile: File): Promise<boolean> {
        const thumbnailPath: string = await generateThumbnailForVideo(storageFilePath, originalFile);

        if (!thumbnailPath) {
            return toastFailedToCreateMediaRecord(originalFile);
        }

        const {error} = await supabasePort
            .from('medias')
            .insert({
                name: originalFile.name,
                mime: originalFile.type,
                size: originalFile.size,
                type: MediaTypeEnum.VIDEO,
                storage_path: storageFilePath,
                thumbnail_path: thumbnailPath
            })

        if (error) {
            return toastFailedToCreateMediaRecord(originalFile);
        }

        return true;
    }

    async function createMediaRecord(storageFilePath: string, originalFile: File): Promise<boolean> {
        return getFileType(originalFile) === imageFileType
            ? createPhotoMediaRecord(storageFilePath, originalFile)
            : createVideoMediaRecord(storageFilePath, originalFile);
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
        reset,
        isImageUploadMode,
        filterPendingFilesForValidForUpload,
    }
})