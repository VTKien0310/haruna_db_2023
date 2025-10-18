import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import { WebpageBookmarkType } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import type {
  CreateWebBookmarkDirectoryData,
  WebBookmarkLinkFormData,
  WebBookmarkHierarchicalData,
} from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import type { ListWebpageBookmarkService } from "@/modules/webpage-bookmark/services/ListWebpageBookmarkService.ts";

export class CreateWebpageBookmarkService {
  private readonly webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
    private readonly listWebpageBookmarkService: ListWebpageBookmarkService,
  ) {}

  async createDirectory(
    creationData: CreateWebBookmarkDirectoryData,
  ): Promise<boolean> {
    const directoryData = {
      name: creationData.name,
      url: "", // a directory doesn't have url
      description: creationData.description,
      type: WebpageBookmarkType.DIRECTORY,
      ...this.getHierarchicalDataFromParent(),
    };

    const { error } = await this.supabasePort
      .from("webpage_bookmarks")
      .insert(directoryData);

    if (error) {
      this.toastService.error("Failed to create directory");
      return false;
    }

    await this.refreshChildrenWebpageBookmarks();

    return true;
  }

  async createLink(creationData: WebBookmarkLinkFormData): Promise<boolean> {
    const linkData = {
      name: creationData.name,
      url: creationData.url,
      description: creationData.description,
      type: WebpageBookmarkType.LINK,
      ...this.getHierarchicalDataFromParent(),
    };

    const { error } = await this.supabasePort
      .from("webpage_bookmarks")
      .insert(linkData);

    if (error) {
      this.toastService.error("Failed to create link");
      return false;
    }

    await this.refreshChildrenWebpageBookmarks();

    return true;
  }

  private getHierarchicalDataFromParent(): WebBookmarkHierarchicalData {
    const parent = this.webpageBookmarkDetailStore.webpageBookmark!;

    if (this.webpageBookmarkDetailStore.currentIsRoot) {
      return {
        root_id: null,
        parent_id: null,
        level: 1,
      };
    }

    return {
      root_id: parent.root_id,
      parent_id: parent.id,
      level: parent.level + 1,
    };
  }

  private async refreshChildrenWebpageBookmarks(): Promise<void> {
    this.webpageBookmarkDetailStore.triggerIsFetchingData();
    await this.listWebpageBookmarkService.refreshChildrenWebpageBookmarks();
    this.webpageBookmarkDetailStore.triggerIsFetchingData();
  }
}
