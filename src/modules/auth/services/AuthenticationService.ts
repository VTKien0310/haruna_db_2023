import {useToast} from 'vuestic-ui';
import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import type {AuthCredential} from '@/modules/auth/AuthTypes';
import router from '@/router';
import {MasterRouteName} from '@/modules/master/MasterRouter';
import type {
  GalleryListService,
} from '@/modules/gallery/services/GalleryListService';
import {AuthRouteName} from '@/modules/auth/AuthRouter';
import type {ProfileService} from '@/modules/auth/services/ProfileService';

export class AuthenticationService {
  private readonly toastInit = useToast().init;

  constructor(
      private readonly supabasePort: SupabaseClient,
      private readonly galleryListService: GalleryListService,
      private readonly profileService: ProfileService,
  ) {}

  async isCurrentlyAuthenticated(): Promise<boolean> {
    const {data: {session}} = await this.supabasePort.auth.getSession();

    return session != null;
  }

  async signIn(credential: AuthCredential): Promise<boolean> {
    const {error} = await this.supabasePort.auth.signInWithPassword(credential);

    if (error) {
      this.toastInit({message: 'Login failed', color: 'danger'});
      return false;
    }

    router.push({
      name: MasterRouteName.MASTER,
    });

    return true;
  }

  async signOut(): Promise<boolean> {
    const {error} = await this.supabasePort.auth.signOut();

    if (error) {
      this.toastInit({message: 'Logout failed', color: 'danger'});
      return false;
    }

    this.galleryListService.reset();

    return true;
  }

  async registerOnAuthStateChange(): Promise<void> {
    this.supabasePort.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          this.profileService.refreshCurrentUserProfile();

          const isNotAuthenticated: boolean = !(session?.user);

          if (isNotAuthenticated) {
            router.push({
              name: AuthRouteName.LOGIN,
            });
          }
        },
    );
  }
}
