import type { BackendPort } from "@/ports/backend/BackendPort";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import type { Router } from "vue-router";
import {
  WEB_BOOKMARK_ROOT_DIR_ID,
  type WebpageBookmark,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import { WebpageBookmarkRouteName } from "@/modules/webpage-bookmark/WebpageBookmarkRouter.ts";
import type { ModalService } from "@/modules/master/services/ModalService.ts";
import { t } from "@/modules/webpage-bookmark/locales";
import type { WebpageBookmarkDetailService } from "@/modules/webpage-bookmark/services/WebpageBookmarkDetailService.ts";

export class DeleteWebpageBookmarkService {
  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly modalService: ModalService,
    private readonly webpageBookmarkDetailService: WebpageBookmarkDetailService,
  ) {}

  private async deleteWebpageBookmarkRecord(
    record: WebpageBookmark,
  ): Promise<boolean> {
    const { error } = await this.backendPort.spbClient
      .from("webpage_bookmarks")
      .delete()
      .eq("id", record.id);

    if (error) {
      this.toastService.error(
        t("messages.deleteRecordFailed", { id: record.id }),
      );
      return false;
    }

    this.toastService.info(
      t("messages.deletedSuccessfully", { name: record.name }),
    );

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
    const { count, error } = await this.backendPort.spbClient
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
      .confirm(t("messages.deleteDirectoryConfirm"))
      .then(async (confirmation: boolean): Promise<void> => {
        if (!confirmation) {
          return;
        }

        const canDeleteDirectory =
          await this.checkDirectoryDeletionCondition(record);
        if (!canDeleteDirectory) {
          this.toastService.error(t("messages.deleteDirectoryHasChildren"));
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
      .confirm(t("messages.deleteLinkConfirm"))
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
