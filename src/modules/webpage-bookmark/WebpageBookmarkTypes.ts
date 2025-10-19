export interface WebBookmarkDirectoryFormData {
  name: string;
  description: string;
}

export interface WebBookmarkLinkFormData {
  name: string;
  url: string;
  description: string;
}

export interface WebBookmarkHierarchicalData {
  root_id: string | null;
  parent_id: string | null;
  level: number;
}
