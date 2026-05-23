import type { BackendPort } from "@/ports/backend/BackendPort";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import type { WebpageBookmarkDetailService } from "@/modules/webpage-bookmark/services/WebpageBookmarkDetailService.ts";
import type { WebpageBookmark } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import type {
  WebBookmarkDirectoryFormData,
  WebBookmarkLinkFormData,
} from "@/modules/webpage-bookmark/WebpageBookmarkTypes.ts";

export class UpdateWebpageBookmarkService {
  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
    private readonly webpageBookmarkDetailService: WebpageBookmarkDetailService,
  ) {}

  private async updateRecord(
    record: WebpageBookmark,
    updateData: Record<string, string>,
  ): Promise<boolean> {
    const { error } = await this.backendPort.spbClient
      .from("webpage_bookmarks")
      .update(updateData)
      .eq("id", record.id);

    if (error) {
      this.toastService.error(`Failed to update record with id ${record.id}`);
      return false;
    }

    return true;
  }

  private async refreshRecordData(record: WebpageBookmark): Promise<void> {
    await this.webpageBookmarkDetailService.loadWebpageBookmarkIntoStore(
      record.id,
    );
  }

  async updateWebpageBookmarkLink(
    record: WebpageBookmark,
    formData: WebBookmarkLinkFormData,
  ): Promise<boolean> {
    if (
      !this.webpageBookmarkDetailService.isLinkWebpageBookmarkRecord(record)
    ) {
      return false;
    }

    const updateResult = await this.updateRecord(record, {
      name: formData.name,
      url: formData.url,
      description: formData.description,
    });
    if (!updateResult) {
      return false;
    }

    await this.refreshRecordData(record);

    return true;
  }

  async updateWebpageBookmarkDirectory(
    record: WebpageBookmark,
    formData: WebBookmarkDirectoryFormData,
  ): Promise<boolean> {
    if (
      !this.webpageBookmarkDetailService.isDirectoryWebpageBookmarkRecord(
        record,
      )
    ) {
      return false;
    }

    const updateResult = await this.updateRecord(record, {
      name: formData.name,
      description: formData.description,
    });
    if (!updateResult) {
      return false;
    }

    await this.refreshRecordData(record);

    return true;
  }
}
