import {useAuthStore} from '@/modules/auth/stores/AuthStore';
import {useToast} from 'vuestic-ui';
import type {SupabaseClient, User} from '@supabase/supabase-js';
import type {ProfileDetail} from '@/modules/auth/AuthTypes';
import {supabasePort} from '@/ports/supabase/SupabasePort';

export class ProfileService {
  private readonly authStore = useAuthStore();
  private readonly toastInit = useToast().init;

  constructor(private readonly supabasePort: SupabaseClient) {}

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
      this.toastInit({
        message: `Failed to fetch current user profile`,
        color: 'danger',
      });

      this.authStore.profile = null;

      return;
    }

    this.authStore.profile = data[0];
  }

  async updateCurrentUserProfile(profileDetail: ProfileDetail): Promise<void> {
    if (profileDetail.password.length >= 8) {
      const {error} = await supabasePort.auth.updateUser(
          {password: profileDetail.password});
      if (error) {
        this.toastInit({
          message: error.message.slice(0, -1), // remove the "." in the error message
          color: 'danger',
        });
      }
    }

    const currentUser = await this.me();
    if (currentUser) {
      const {error} = await supabasePort.from('profiles').update({
        name: profileDetail.name,
      }).eq('user_id', currentUser.id);

      if (error) {
        this.toastInit({
          message: `Failed to update username`,
          color: 'danger',
        });
      }
    }

    await this.refreshCurrentUserProfile();
  }
}
