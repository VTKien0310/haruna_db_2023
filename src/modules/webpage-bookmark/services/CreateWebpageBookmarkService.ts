import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import type { WebpageBookmark } from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";

export class CreateWebpageBookmarkService {
  constructor(
    private readonly supabasePort: SupabaseClient,
    private readonly toastService: ToastService,
  ) {}

  createDirectory(name: string, parent: WebpageBookmark) {}
}
