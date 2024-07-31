import {useAuthStore} from '@/modules/auth/stores/AuthStore';
import type {SupabaseClient, User} from '@supabase/supabase-js';
import type {ProfileDetail} from '@/modules/auth/AuthTypes';
import {supabasePort} from '@/ports/supabase/SupabasePort';
import type {ToastService} from '@/modules/master/services/ToastService';

export class ProfileService {
  private readonly authStore = useAuthStore();

  constructor(
      private readonly supabasePort: SupabaseClient,
      private readonly toastService: ToastService,
  ) {}

  async me(): Promise<User | null> {
    const {data: {user}} = await this.supabasePort.auth.getUser();

    return user;
  }

  async refreshCurrentUserProfile(): Promise<void> {
    const currentUser = await this.me();
    if (!currentUser) {
      this.authStore.profile = null;
      return;
    }

    const {data, error} = await this.supabasePort.from('profiles').
        select().
        eq('user_id', currentUser.id);

    if (error || !data) {
      this.toastService.error(`Failed to fetch current user profile`);

      this.authStore.profile = null;

      return;
    }

    this.authStore.profile = data[0];
  }

  async updateCurrentUserProfile(profileDetail: ProfileDetail): Promise<void> {
    if (profileDetail.password.length >= 8) {
      const {error} = await supabasePort.auth.updateUser(
          {password: profileDetail.password},
      );
      if (error) {
        const errorMessage = error.message.slice(0, -1); // remove the "." in the error message
        this.toastService.error(errorMessage);
      }
    }

    const currentUser = await this.me();
    if (currentUser) {
      const {error} = await supabasePort.from('profiles').update({
        name: profileDetail.name,
      }).eq('user_id', currentUser.id);

      if (error) {
        this.toastService.error(`Failed to update username`);
      }
    }

    await this.refreshCurrentUserProfile();
  }
}
