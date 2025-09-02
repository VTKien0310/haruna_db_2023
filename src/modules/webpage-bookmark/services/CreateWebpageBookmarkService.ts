import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import {
  type WebpageBookmark,
  WebpageBookmarkType,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import type {
  CreateWebBookmarkDirectoryData,
  CreateWebBookmarkLinkData,
  WebBookmarkHierarchicalData,
} from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";

export class CreateWebpageBookmarkService {
  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
  ) {}

  async createDirectory(
    creationData: CreateWebBookmarkDirectoryData,
    parent?: WebpageBookmark,
  ): Promise<boolean> {
    const directoryData = {
      name: creationData.name,
      url: "", // a directory doesn't have url
      description: creationData.description,
      type: WebpageBookmarkType.DIRECTORY,
      ...this.getHierarchicalDataFromParent(parent),
    };

    const { error } = await this.supabasePort
      .from("webpage_bookmarks")
      .insert(directoryData);

    if (error) {
      this.toastService.error("Failed to create directory");
      return false;
    }

    return true;
  }

  async createLink(
    creationData: CreateWebBookmarkLinkData,
    parent?: WebpageBookmark,
  ): Promise<boolean> {
    const linkData = {
      name: creationData.name,
      url: creationData.url,
      description: creationData.description,
      type: WebpageBookmarkType.LINK,
      ...this.getHierarchicalDataFromParent(parent),
    };

    const { error } = await this.supabasePort
      .from("webpage_bookmarks")
      .insert(linkData);

    if (error) {
      this.toastService.error("Failed to create link");
      return false;
    }

    return true;
  }

  private getHierarchicalDataFromParent(
    parent?: WebpageBookmark,
  ): WebBookmarkHierarchicalData {
    return {
      root_id: parent?.root_id ?? null,
      parent_id: parent?.id ?? null,
      level: parent ? parent.level + 1 : 1,
    };
  }
}
