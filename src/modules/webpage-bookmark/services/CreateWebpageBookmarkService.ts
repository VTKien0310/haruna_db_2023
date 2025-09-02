import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import {
  type WebpageBookmark,
  WebpageBookmarkType,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";

export class CreateWebpageBookmarkService {
  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
  ) {}

  async createDirectory(
    name: string,
    description: string,
    parent?: WebpageBookmark,
  ): Promise<void> {
    const directoryData = {
      name: name,
      description: description,
      type: WebpageBookmarkType.DIRECTORY,
      root_id: parent ? parent.root_id : null,
      parent_id: parent ? parent.id : null,
      level: parent ? parent.level + 1 : 0,
    };

    const { error } = await this.supabasePort
      .from("webpage_bookmarks")
      .insert(directoryData);

    if (error) {
      this.toastService.error("Failed to create directory");
    }
  }
}
