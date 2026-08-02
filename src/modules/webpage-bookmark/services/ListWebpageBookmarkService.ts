import type { BackendPort } from "@/ports/backend/BackendPort";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import {
  type WebpageBookmark,
  WebpageBookmarkType,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";

export class ListWebpageBookmarkService {
  private readonly webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
  ) {}

  async refreshChildrenWebpageBookmarks(): Promise<void> {
    if (!this.webpageBookmarkDetailStore.currentIsDirectory) {
      this.webpageBookmarkDetailStore.webpageBookmarkChildren = [];
      return;
    }

    if (this.webpageBookmarkDetailStore.currentIsRoot) {
      this.webpageBookmarkDetailStore.webpageBookmarkChildren =
        await this.listLevelOneRecords();
      return;
    }

    this.webpageBookmarkDetailStore.webpageBookmarkChildren =
      await this.listLevelChildrenRecords();
  }

  private async listLevelOneRecords(): Promise<WebpageBookmark[]> {
    const { data, error } = await this.backendPort.spbClient
      .from("webpage_bookmarks")
      .select()
      .limit(100)
      .eq("level", 1)
      .order("type", { ascending: true })
      .order("name", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) {
      this.toastService.error(`Failed to fetch level 1 records`);
      return [];
    }

    return data;
  }

  private async listLevelChildrenRecords(): Promise<WebpageBookmark[]> {
    const currentRecord = this.webpageBookmarkDetailStore.webpageBookmark!;

    const { data, error } = await this.backendPort.spbClient
      .from("webpage_bookmarks")
      .select()
      .limit(100)
      .eq("parent_id", currentRecord.id)
      .eq("level", currentRecord.level + 1)
      .order("type", { ascending: true })
      .order("name", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) {
      this.toastService.error(
        `Failed to fetch children records of ${currentRecord.id}`,
      );
      return [];
    }

    return data;
  }

  async countWebpageBookmarkLinks(): Promise<number> {
    const { count, error } = await this.backendPort.spbClient
      .from("webpage_bookmarks")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("type", WebpageBookmarkType.LINK);

    if (error || count === null) {
      this.toastService.error(`Failed to count webpage bookmark links`);
      return 0;
    }

    return count;
  }

  async countWebpageBookmarkDirectories(): Promise<number> {
    const { count, error } = await this.backendPort.spbClient
      .from("webpage_bookmarks")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("type", WebpageBookmarkType.DIRECTORY);

    if (error || count === null) {
      this.toastService.error(`Failed to count webpage bookmark directories`);
      return 0;
    }

    return count;
  }

  async getDeepestLevelWebpageBookmark(): Promise<number> {
    const { data, error } = await this.backendPort.spbClient
      .from("webpage_bookmarks")
      .select("deepest_level:level.max()");

    if (error || !data) {
      return 0;
    }

    return data[0]?.deepest_level ?? 0;
  }
}
