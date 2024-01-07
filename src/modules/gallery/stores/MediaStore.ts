import {defineStore} from "pinia";
import type {Media} from "@/modules/gallery/GalleryEntities";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import {useModal, useToast} from "vuestic-ui";
import type {TransformOptions} from "@supabase/storage-js/src/lib/types";
import router from "@/router";
import {GalleryRouteName} from "@/modules/gallery/GalleryRouter";
import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import {domPort} from "@/ports/dom/DomPort";
import type {Profile} from "@/modules/auth/ProfileEntities";
import dayjs from "dayjs";

export const useMediaStore = defineStore('media-store', () => {
    const {init} = useToast();

    async function createSignedUrlForMedia(media: Media, options: {
        download?: string | boolean;
        transform?: TransformOptions
    }): Promise<string> {
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
                width: 75,
                height: 75
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

    const {confirm} = useModal();

    async function deleteMediaRecordInDb(id: string): Promise<boolean> {
        const {error} = await supabasePort
            .from('medias')
            .delete()
            .eq('id', id)

        return !error;
    }

    async function deleteMediaFileInBucket(storagePath: string) {
        const {data, error} = await supabasePort.storage
            .from('medias')
            .remove([storagePath])

        return !error;
    }

    const galleryListStore = useGalleryListStore();

    function redirectAndRefreshGallery(): void {
        router.push({
            name: GalleryRouteName.LIST
        })
        galleryListStore.refreshMedias();
    }

    async function deleteMedia(media: Media): Promise<void> {
        confirm(`Proceed to delete the file?`).then(
            async (confirmation: boolean): Promise<void> => {
                if (!confirmation) {
                    return
                }

                const deleteDbRecordSuccess = await deleteMediaRecordInDb(media.id)

                const deleteFileInBucketSuccess = deleteDbRecordSuccess
                    ? await deleteMediaFileInBucket(media.storage_path)
                    : false

                if (!(deleteDbRecordSuccess && deleteFileInBucketSuccess)) {
                    init({
                        message: `Failed to delete media with id ${media.id}`,
                        color: 'danger'
                    })
                    return
                }

                redirectAndRefreshGallery()
            }
        )
    }

    async function downloadMedia(media: Media): Promise<void> {
        const {data, error} = await supabasePort.storage
            .from('medias')
            .download(media.storage_path)

        if (error || !data) {
            init({
                message: `Failed to download media with id ${media.id}`,
                color: 'danger'
            })
            return
        }

        domPort.triggerDownloadBlob(data, media.name)
    }

    async function getMediaUploader(media: Media): Promise<Profile | null> {
        const {data, error} = await supabasePort
            .from('profiles')
            .select()
            .eq('user_id', media.uploader_id)

        if (error || !data) {
            init({
                message: `Failed to fetch uploader of media with id ${media.id}`,
                color: 'danger'
            })
            return null;
        }

        return data[0];
    }

    /**
     * Stolen from https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
     *
     * @param bytes
     * @param decimals
     */
    function transformMediaSizeToReadableFormat(bytes: number, decimals: number = 2): string {
        if (bytes == 0) return '0 Bytes';

        const k = 1024,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    }

    function transformMediaCreatedAtToReadableFormat(media: Media): string {
        return dayjs(media.created_at).format('DD/MM/YYYY')
    }

    return {
        createThumbnailUrlForMedia,
        createFullSizeViewUrlForMedia,
        getMediaById,
        deleteMedia,
        downloadMedia,
        getMediaUploader,
        transformMediaSizeToReadableFormat,
        transformMediaCreatedAtToReadableFormat
    }
})