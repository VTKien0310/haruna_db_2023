import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import type { User } from "@supabase/supabase-js";
import type { BackendPort } from "@/ports/backend/BackendPort";
import type { ProfileDetail } from "@/modules/auth/AuthTypes";
import { t } from "@/modules/auth/locales";
import type { ToastService } from "@/modules/master/services/ToastService";

export class ProfileService {
  private readonly authStore = useAuthStore();

  constructor(
    private readonly backendPort: BackendPort,
    private readonly toastService: ToastService,
  ) {}

  async me(): Promise<User | null> {
    const {
      data: { user },
    } = await this.backendPort.spbClient.auth.getUser();

    return user;
  }

  async refreshCurrentUserProfile(): Promise<void> {
    const currentUser = await this.me();
    if (!currentUser) {
      this.authStore.profile = null;
      this.authStore.userSpecialPermissions = [];
      return;
    }

    const [profileResult, specialPermissionsResult] = await Promise.all([
      this.backendPort.spbClient
        .from("profiles")
        .select()
        .eq("user_id", currentUser.id),
      this.backendPort.spbClient
        .from("user_special_permissions")
        .select()
        .eq("user_id", currentUser.id),
    ]);

    if (profileResult.error || !profileResult.data) {
      this.toastService.error(t("messages.fetchProfileFailed"));
      this.authStore.profile = null;
    } else {
      this.authStore.profile = profileResult.data[0];
    }

    if (specialPermissionsResult.error || !specialPermissionsResult.data) {
      this.toastService.error(t("messages.fetchSpecialPermissionsFailed"));
      this.authStore.userSpecialPermissions = [];
      return;
    }

    this.authStore.userSpecialPermissions = specialPermissionsResult.data;
  }

  async updateCurrentUserProfile(profileDetail: ProfileDetail): Promise<void> {
    if (profileDetail.password.length >= 8) {
      const { error } = await this.backendPort.spbClient.auth.updateUser({
        password: profileDetail.password,
      });
      if (error) {
        this.toastService.error(t("messages.updatePasswordFailed"));
      }
    }

    const currentUser = await this.me();
    if (currentUser) {
      const { error } = await this.backendPort.spbClient
        .from("profiles")
        .update({
          name: profileDetail.name,
          birth_date: profileDetail.birthDate,
          work_start_date: profileDetail.workStartDate,
        })
        .eq("user_id", currentUser.id);

      if (error) {
        this.toastService.error(t("messages.updateProfileFailed"));
      }
    }

    await this.refreshCurrentUserProfile();
  }
}
