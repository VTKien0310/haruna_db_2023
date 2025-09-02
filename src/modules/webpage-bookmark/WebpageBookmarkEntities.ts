export enum WebpageBookmarkType {
  DIRECTORY = 0,
  LINK = 1,
}

export interface WebpageBookmark {
  id: string;
  owner_id: string;
  url: string;
  name: string;
  description: string;
  type: WebpageBookmarkType;
  root_id: string | null;
  parent_id: string | null;
  level: number;
  created_at: string;
  updated_at: string;
}

export const WEB_BOOKMARK_ROOT_DIR_ID = "WEBPAGE_BOOKMARK_ROOT_DIRECTORY";

export const makeVirtualWebBookmarkRootDirectory = (
  owner_id: string,
): WebpageBookmark => ({
  id: WEB_BOOKMARK_ROOT_DIR_ID,
  owner_id,
  url: "",
  name: "/",
  description: "",
  type: WebpageBookmarkType.DIRECTORY,
  root_id: null,
  parent_id: null,
  level: 0,
  created_at: "",
  updated_at: "",
});
