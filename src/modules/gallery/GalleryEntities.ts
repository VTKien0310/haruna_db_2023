export enum MediaTypeEnum {
    PHOTO = 0,
    VIDEO = 1
}

export interface Media {
    id: string
    mime: string
    name: string
    size: number
    type: MediaTypeEnum
    storage_path: string
    thumbnail_path: string | null
    created_at: string
    updated_at: string
    uploader_id: string
}