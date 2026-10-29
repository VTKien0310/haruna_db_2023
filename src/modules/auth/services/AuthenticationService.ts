import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { BackendPort } from "@/ports/backend/BackendPort";
import type {
  AuthCredential,
  PasswordResetAvailability,
} from "@/modules/auth/AuthTypes";
import { MasterRouteName } from "@/modules/master/MasterRouter";
import type { GalleryListService } from "@/modules/gallery/services/GalleryListService";
import { AuthRouteName } from "@/modules/auth/AuthRouter";
import type { ProfileService } from "@/modules/auth/services/ProfileService";
import type { ToastService } from "@/modules/master/services/ToastService";
import type { Router } from "vue-router";
import type { TranslationService } from "@/modules/translation/TranslationService";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";

const RESET_EMAIL_SENT =
  "If an account exists for that email, a reset link has been sent.";
const RESET_EMAIL_FAILED = "Could not send reset email";
const PASSWORD_UPDATED = "Password updated";
const PASSWORD_UPDATE_FAILED = "Could not update password";
const MINIMUM_PASSWORD_LENGTH = 8;

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
    useAuthStore().passwordRecoveryRequired = false;

    return true;
  }

  openForgotPassword(): void {
    this.router.push({
      name: AuthRouteName.FORGOT_PASSWORD,
    });
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const { error } =
      await this.backendPort.spbClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

    if (error && error.code !== "user_not_found") {
      this.toastService.error(RESET_EMAIL_FAILED);
      return false;
    }

    this.toastService.info(RESET_EMAIL_SENT);
    this.router.push({
      name: AuthRouteName.LOGIN,
    });

    return true;
  }

  async preparePasswordReset(): Promise<PasswordResetAvailability> {
    if (useAuthStore().passwordRecoveryRequired) {
      return "ready";
    }

    const {
      data: { session },
    } = await this.backendPort.spbClient.auth.getSession();

    if (useAuthStore().passwordRecoveryRequired) {
      return "ready";
    }

    if (session) {
      this.router.push({
        name: MasterRouteName.MASTER,
      });
      return "authenticated";
    }

    return "invalid";
  }

  async resetPassword(password: string): Promise<boolean> {
    const authStore = useAuthStore();
    if (
      !authStore.passwordRecoveryRequired ||
      password.length < MINIMUM_PASSWORD_LENGTH
    ) {
      return false;
    }

    const { error } = await this.backendPort.spbClient.auth.updateUser({
      password,
    });

    if (error) {
      this.toastService.error(PASSWORD_UPDATE_FAILED);
      return false;
    }

    authStore.passwordRecoveryRequired = false;
    this.toastService.info(PASSWORD_UPDATED);
    this.router.push({
      name: MasterRouteName.MASTER,
    });

    return true;
  }

  async registerOnAuthStateChange(): Promise<void> {
    this.backendPort.spbClient.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        this.profileService.refreshCurrentUserProfile();

        if (event === "PASSWORD_RECOVERY" && session?.user) {
          useAuthStore().passwordRecoveryRequired = true;
          this.router.push({
            name: AuthRouteName.RESET_PASSWORD,
          });
          return;
        }

        const isNotAuthenticated: boolean = !session?.user;

        if (isNotAuthenticated) {
          useAuthStore().passwordRecoveryRequired = false;
          this.router.push({
            name: AuthRouteName.LOGIN,
          });
        }
      },
    );
  }
}
