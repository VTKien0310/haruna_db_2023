import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import type { WebpageBookmark } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";

export class ListWebpageBookmarkService {
  private readonly webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
  ) {}

  async refreshChildrenWebpageBookmarks(): Promise<void> {
    if (!this.webpageBookmarkDetailStore.currentRecordIsDirectory) {
      this.webpageBookmarkDetailStore.webpageBookmarkChildren = [];
      return;
    }

    if (this.webpageBookmarkDetailStore.currentRecordIsRoot) {
      this.webpageBookmarkDetailStore.webpageBookmarkChildren =
        await this.listLevelOneRecords();
      return;
    }

    this.webpageBookmarkDetailStore.webpageBookmarkChildren =
      await this.listLevelChildrenRecords();
  }

  private async listLevelOneRecords(): Promise<WebpageBookmark[]> {
    const { data, error } = await this.supabasePort
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

    const { data, error } = await this.supabasePort
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
}
