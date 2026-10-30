import type { BackendPort } from "@/ports/backend/BackendPort";
import dayjs from "dayjs";
import type { Media } from "@/modules/gallery/GalleryEntities";
import { t } from "@/modules/gallery/locales";
import type { ToastService } from "@/modules/master/services/ToastService";

export class GalleryStatisticService {
  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
  ) {}

  async countTotalMedias(): Promise<number> {
    const { count, error } = await this.backendPort.spbClient
      .from("medias")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (error || count === null) {
      this.toastService.error(t("countTotalFailed"));

      return 0;
    }

    return count;
  }

  async countUserUploadedMedias(userId: string): Promise<number> {
    const { count, error } = await this.backendPort.spbClient
      .from("medias")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("uploader_id", userId);

    if (error || count === null) {
      this.toastService.error(t("countUserUploadsFailed"));

      return 0;
    }

    return count;
  }

  async countUploadedMediasWithinPassDays(days: number): Promise<number> {
    const targetPointInTime: string = dayjs()
      .subtract(days, "day")
      .utc()
      .toISOString();

    const { count, error } = await this.backendPort.spbClient
      .from("medias")
      .select("*", {
        count: "exact",
        head: true,
      })
      .filter("created_at", "gte", targetPointInTime);

    if (error || count === null) {
      this.toastService.error(t("countNewUploadsFailed"));

      return 0;
    }

    return count;
  }

  async getLatestUploadMedia(): Promise<Media | null> {
    const { data, error } = await this.backendPort.spbClient
      .from("medias")
      .select()
      .limit(1)
      .order("created_at", { ascending: false });

    if (error || data === null || data.length === 0) {
      return null;
    }

    return data[0];
  }
}
