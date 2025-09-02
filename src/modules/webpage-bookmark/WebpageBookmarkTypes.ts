export interface CreateWebBookmarkDirectoryData {
  name: string;
  description: string;
}

export interface CreateWebBookmarkLinkData {
  name: string;
  url: string;
  description: string;
}

export interface WebBookmarkHierarchicalData {
  root_id: string | null;
  parent_id: string | null;
  level: number;
}
