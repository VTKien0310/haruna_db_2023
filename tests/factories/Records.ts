import type { Media } from "@/modules/gallery/GalleryEntities";
import type { Profile } from "@/modules/auth/ProfileEntities";
import type { TranslationHistory } from "@/modules/translation/TranslationEntities";
import type { WebpageBookmark } from "@/modules/webpage-bookmark/WebpageBookmarkEntities";

const timestamp = "2026-01-02T12:00:00Z";
export const makeMedia = (overrides: Partial<Media> = {}): Media => ({
  id: "media-1",
  name: "photo.png",
  mime: "image/png",
  size: 1024,
  type: 0,
  storage_path: "photo.png",
  thumbnail_path: null,
  uploader_id: "user-1",
  created_at: timestamp,
  updated_at: timestamp,
  ...overrides,
});
export const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: "profile-1",
  name: "Test User",
  user_id: "user-1",
  created_at: timestamp,
  updated_at: timestamp,
  ...overrides,
});
export const makeHistory = (
  overrides: Partial<TranslationHistory> = {},
): TranslationHistory => ({
  id: "history-1",
  owner_id: "user-1",
  source_language: "ja",
  target_language: "en",
  source_text: "こんにちは",
  translation: "Hello",
  created_at: timestamp,
  ...overrides,
});
export const makeBookmark = (
  overrides: Partial<WebpageBookmark> = {},
): WebpageBookmark => ({
  id: "bookmark-1",
  owner_id: "user-1",
  url: "",
  name: "Bookmarks",
  description: "",
  type: 0,
  root_id: "bookmark-1",
  parent_id: null,
  level: 1,
  created_at: timestamp,
  updated_at: timestamp,
  ...overrides,
});
