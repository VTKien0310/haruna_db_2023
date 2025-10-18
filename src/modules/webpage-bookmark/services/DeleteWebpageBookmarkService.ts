import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import type { Router } from "vue-router";
import {
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
  WebpageBookmarkType,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter.ts";
import type { ModalService } from "@/modules/master/services/ModalService.ts";

export class DeleteWebpageBookmarkService {
  private readonly webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();

  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly modalService: ModalService,
  ) {}

  private async deleteWebpageBookmarkRecord(
    record: WebpageBookmark,
  ): Promise<boolean> {
    const { error } = await this.supabasePort
      .from("webpage_bookmarks")
      .delete()
      .eq("id", record.id);

    if (error) {
      this.toastService.error(
        `Failed to delete bookmark record with id ${record.id}`,
      );
      return false;
    }

    return true;
  }

  private redirectToParentDirectory(record: WebpageBookmark): void {
    this.router.push({
      name: WebpageBookmarkRouteName.ROOT,
      params: { id: record.parent_id ?? WEB_BOOKMARK_ROOT_DIR_ID },
    });
  }

  deleteWebpageBookmarkLink(record: WebpageBookmark): void {
    if (record.type !== WebpageBookmarkType.LINK) {
      return;
    }

    this.modalService
      .confirm("Are you sure you want to delete this link?")
      .then(async (confirmation: boolean): Promise<void> => {
        if (!confirmation) {
          return;
        }

        const deleteSuccess = await this.deleteWebpageBookmarkRecord(record);

        if (!deleteSuccess) {
          return;
        }

        this.redirectToParentDirectory(record);
      });
  }
}
