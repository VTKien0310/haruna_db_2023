import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import type { Router } from "vue-router";
import {
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter.ts";
import type { ModalService } from "@/modules/master/services/ModalService.ts";
import type { WebpageBookmarkDetailService } from "@/modules/webpage-bookmark/services/WebpageBookmarkDetailService.ts";

export class DeleteWebpageBookmarkService {
  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly modalService: ModalService,
    private readonly webpageBookmarkDetailService: WebpageBookmarkDetailService,
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

    this.toastService.info(`Deleted ${record.name} successfully`);

    return true;
  }

  private redirectToParentDirectory(record: WebpageBookmark): void {
    this.router.push({
      name: WebpageBookmarkRouteName.ROOT,
      params: { id: record.parent_id ?? WEB_BOOKMARK_ROOT_DIR_ID },
    });
  }

  private async checkDirectoryDeletionCondition(
    record: WebpageBookmark,
  ): Promise<boolean> {
    const { count, error } = await this.supabasePort
      .from("webpage_bookmarks")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("parent_id", record.id);

    if (error) {
      return false;
    }

    return count === 0;
  }

  deleteWebpageBookmarkDirectory(record: WebpageBookmark): void {
    if (
      !this.webpageBookmarkDetailService.isDirectoryWebpageBookmarkRecord(
        record,
      )
    ) {
      return;
    }

    this.modalService
      .confirm("Are you sure you want to delete this directory?")
      .then(async (confirmation: boolean): Promise<void> => {
        if (!confirmation) {
          return;
        }

        const canDeleteDirectory =
          await this.checkDirectoryDeletionCondition(record);
        if (!canDeleteDirectory) {
          this.toastService.error(
            "Cannot delete directory because it has children",
          );
          return;
        }

        const deleteSuccess = await this.deleteWebpageBookmarkRecord(record);
        if (!deleteSuccess) {
          return;
        }

        this.redirectToParentDirectory(record);
      });
  }

  deleteWebpageBookmarkLink(record: WebpageBookmark): void {
    if (
      !this.webpageBookmarkDetailService.isLinkWebpageBookmarkRecord(record)
    ) {
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
