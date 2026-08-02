import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { BackendPort } from "@/ports/backend/BackendPort";
import type { AuthCredential } from "@/modules/auth/AuthTypes";
import { MasterRouteName } from "@/modules/master/MasterRouter";
import type { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { AuthRouteName } from "@/modules/auth/AuthRouter";
import type { ProfileService } from "@/modules/auth/services/ProfileService";
import type { ToastService } from "@/modules/master/services/ToastService";
import type { Router } from "vue-router";
import type { TranslationService } from "@/modules/translation/TranslationService";

export class AuthenticationService {
  constructor(
    private readonly router: Router,
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
    private readonly galleryListService: GalleryListService,
    private readonly profileService: ProfileService,
    private readonly translationService: TranslationService,
  ) {}

  async isCurrentlyAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await this.backendPort.spbClient.auth.getSession();

    return session != null;
  }

  async signIn(credential: AuthCredential): Promise<boolean> {
    const { error } =
      await this.backendPort.spbClient.auth.signInWithPassword(credential);

    if (error) {
      this.toastService.error("Login failed");
      return false;
    }

    this.router.push({
      name: MasterRouteName.MASTER,
    });

    return true;
  }

  async signOut(): Promise<boolean> {
    const { error } = await this.backendPort.spbClient.auth.signOut();

    if (error) {
      this.toastService.error("Logout failed");
      return false;
    }

    this.galleryListService.reset();
    this.translationService.resetHistories();

    return true;
  }

  async registerOnAuthStateChange(): Promise<void> {
    this.backendPort.spbClient.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        this.profileService.refreshCurrentUserProfile();

        const isNotAuthenticated: boolean = !session?.user;

        if (isNotAuthenticated) {
          this.router.push({
            name: AuthRouteName.LOGIN,
          });
        }
      },
    );
  }
}
