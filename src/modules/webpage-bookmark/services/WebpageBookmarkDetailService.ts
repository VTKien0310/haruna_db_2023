import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import {
  makeVirtualWebBookmarkRootDirectory,
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import type { MasterNavigationService } from "@/modules/master/services/MasterNavigationService.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import { useAuthStore } from "@/modules/auth/stores/AuthStore.ts";
import type { ListWebpageBookmarkService } from "@/modules/webpage-bookmark/services/ListWebpageBookmarkService.ts";

export class WebpageBookmarkDetailService {
  private readonly webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();
  private readonly authStore = useAuthStore();

  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
    private readonly masterNavigationService: MasterNavigationService,
    private readonly listWebpageBookmarkService: ListWebpageBookmarkService,
  ) {}

  async getWebpageBookmarkRecord(id: string): Promise<WebpageBookmark | null> {
    const { data, error } = await this.supabasePort
      .from("webpage_bookmarks")
      .select()
      .limit(1)
      .eq("id", id);

    if (error || !data) {
      this.toastService.error(`Failed to fetch bookmark record with id ${id}`);
      this.masterNavigationService.navigateTo400();
      return null;
    }

    if (!data[0]) {
      this.toastService.error(`Bookmark record with id ${id} not found`);
      this.masterNavigationService.navigateTo404();
      return null;
    }

    return data[0];
  }

  async loadWebpageBookmarkIntoStore(id: string): Promise<void> {
    this.webpageBookmarkDetailStore.triggerIsFetchingData();

    // since the root directory is not stored in the database, we create a virtual one here
    this.webpageBookmarkDetailStore.webpageBookmark =
      id === WEB_BOOKMARK_ROOT_DIR_ID
        ? makeVirtualWebBookmarkRootDirectory(
            this.authStore.profile?.user_id ?? "",
          )
        : await this.getWebpageBookmarkRecord(id);

    await this.listWebpageBookmarkService.refreshChildrenWebpageBookmarks();

    this.webpageBookmarkDetailStore.triggerIsFetchingData();
  }
}
