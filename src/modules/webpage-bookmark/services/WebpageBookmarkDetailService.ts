import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import type { WebpageBookmark } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import type { MasterNavigationService } from "@/modules/master/services/MasterNavigationService.ts";

export class WebpageBookmarkDetailService {
  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
    private readonly masterNavigationService: MasterNavigationService,
  ) {}

  async getWebpageBookmark(id: string): Promise<WebpageBookmark | null> {
    const { data, error } = await this.supabasePort
      .from("webpage_bookmarks")
      .select()
      .limit(1)
      .eq("id", id);

    if (error || !data) {
      this.toastService.error(`Failed to fetch bookmark record with id ${id}`);
      this.masterNavigationService.navigateTo404();
      return null;
    }

    if (!data[0]) {
      this.toastService.error(`Bookmark record with id ${id} not found`);
      this.masterNavigationService.navigateTo404();
      return null;
    }

    return data[0];
  }
}
