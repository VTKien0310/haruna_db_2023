import type { BackendPort } from "@/ports/backend/BackendPort";
import type { ToastService } from "@/modules/master/services/ToastService.ts";
import {
  makeVirtualWebBookmarkRootDirectory,
  WEB_BOOKMARK_ROOT_DIR_ID,
  WEB_BOOKMARK_ROOT_DIR_NAME,
  type WebpageBookmark,
  WebpageBookmarkType,
} from "@/modules/webpage-bookmark/WebpageBookmarkEntities.ts";
import type { MasterNavigationService } from "@/modules/master/services/MasterNavigationService.ts";
import { useWebpageBookmarkDetailStore } from "@/modules/webpage-bookmark/stores/WebpageBookmarkDetailStore.ts";
import { useAuthStore } from "@/modules/auth/stores/AuthStore.ts";
import type { ListWebpageBookmarkService } from "@/modules/webpage-bookmark/services/ListWebpageBookmarkService.ts";

export class WebpageBookmarkDetailService {
  private readonly webpageBookmarkDetailStore = useWebpageBookmarkDetailStore();
  private readonly authStore = useAuthStore();

  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
    private readonly masterNavigationService: MasterNavigationService,
    private readonly listWebpageBookmarkService: ListWebpageBookmarkService,
  ) {}

  private async getWebpageBookmarkRecord(
    id: string,
  ): Promise<WebpageBookmark | null> {
    const { data, error } = await this.backendPort.spbClient
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

  async getWebpageBookmarkRoot(
    webpageBookmark: WebpageBookmark,
  ): Promise<WebpageBookmark | null> {
    if (webpageBookmark.root_id === null) {
      return null;
    }

    if (webpageBookmark.root_id === webpageBookmark.id) {
      return webpageBookmark;
    }

    return await this.getWebpageBookmarkRecord(webpageBookmark.root_id);
  }

  async getWebpageBookmarkParent(
    webpageBookmark: WebpageBookmark,
  ): Promise<WebpageBookmark | null> {
    if (webpageBookmark.parent_id === null) {
      return null;
    }

    return await this.getWebpageBookmarkRecord(webpageBookmark.parent_id);
  }

  async loadWebpageBookmarkIntoStore(id: string): Promise<void> {
    this.webpageBookmarkDetailStore.triggerIsFetchingData();

    // since the root directory is not stored in the database, we create a virtual one here
    const fetchedWebpageBookmark: WebpageBookmark | null =
      id === WEB_BOOKMARK_ROOT_DIR_ID
        ? makeVirtualWebBookmarkRootDirectory(
            this.authStore.profile?.user_id ?? "",
          )
        : await this.getWebpageBookmarkRecord(id);

    this.webpageBookmarkDetailStore.webpageBookmark = fetchedWebpageBookmark;

    this.webpageBookmarkDetailStore.webpageBookmarkHeaderTitle =
      await this.makeWebpageBookmarkHeaderTitle(fetchedWebpageBookmark);

    await this.listWebpageBookmarkService.refreshChildrenWebpageBookmarks();

    this.webpageBookmarkDetailStore.triggerIsFetchingData();
  }

  isDirectoryWebpageBookmarkRecord(webpageBookmark: WebpageBookmark): boolean {
    return webpageBookmark.type === WebpageBookmarkType.DIRECTORY;
  }

  isLinkWebpageBookmarkRecord(webpageBookmark: WebpageBookmark): boolean {
    return webpageBookmark.type === WebpageBookmarkType.LINK;
  }

  private async makeWebpageBookmarkHeaderTitle(
    webpageBookmark: WebpageBookmark | null,
  ): Promise<string> {
    if (!webpageBookmark) {
      return "";
    }

    if (webpageBookmark.id === WEB_BOOKMARK_ROOT_DIR_ID) {
      return WEB_BOOKMARK_ROOT_DIR_NAME;
    }

    const pathParts: string[] = [WEB_BOOKMARK_ROOT_DIR_NAME];

    // Level 1: Root / Item
    if (webpageBookmark.level === 1) {
      pathParts.push(webpageBookmark.name);
      return pathParts.join(" / ");
    }

    // Level 2+: Fetch root bookmark
    const rootWebpageBookmark =
      await this.getWebpageBookmarkRoot(webpageBookmark);
    if (rootWebpageBookmark?.name) {
      pathParts.push(rootWebpageBookmark.name);
    }

    // Level 2: Root / Level1 / Item
    if (webpageBookmark.level === 2) {
      pathParts.push(webpageBookmark.name);
      return pathParts.join(" / ");
    }

    // Level 3+: Fetch parent bookmark
    const parentWebpageBookmark =
      await this.getWebpageBookmarkParent(webpageBookmark);

    // Level 3: Root / Level1 / Level2 / Item
    if (webpageBookmark.level === 3) {
      if (parentWebpageBookmark?.name) {
        pathParts.push(parentWebpageBookmark.name);
      }
      pathParts.push(webpageBookmark.name);
      return pathParts.join(" / ");
    }

    // Level 4+: Root / Level1 / .. / Parent / Item
    pathParts.push("..");
    if (parentWebpageBookmark?.name) {
      pathParts.push(parentWebpageBookmark.name);
    }
    pathParts.push(webpageBookmark.name);
    return pathParts.join(" / ");
  }
}
