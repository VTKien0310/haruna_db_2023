import {defineStore} from "pinia";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import type {AuthChangeEvent, Session, User} from "@supabase/supabase-js";
import router from "@/router";
import {AuthRouteName} from "@/modules/auth/AuthRouter";
import type {AuthCredential, ProfileDetail} from "@/modules/auth/AuthTypes";
import {useToast} from "vuestic-ui";
import {MasterRouteName} from "@/modules/master/MasterRouter";
import {useGalleryListStore} from "@/modules/gallery/stores/GalleryListStore";
import type {Profile} from "@/modules/auth/ProfileEntities";
import {ref} from "vue";

export const useAuthStore = defineStore('auth', () => {
    const {init} = useToast();

    async function me(): Promise<User | null> {
        const {data: {user}} = await supabasePort.auth.getUser();

        return user
    }

    async function isCurrentlyAuthenticated(): Promise<boolean> {
        const {data: {session},} = await supabasePort.auth.getSession();

        return session != null;
    }

    async function signIn(credential: AuthCredential): Promise<boolean> {
        const {error} = await supabasePort.auth.signInWithPassword(credential)

        if (error) {
            init({message: 'Login failed', color: 'danger'})
            return false;
        }

        router.push({
            name: MasterRouteName.MASTER
        });

        return true;
    }

    const galleryListStore = useGalleryListStore();

    async function signOut(): Promise<boolean> {
        const {error} = await supabasePort.auth.signOut()

        if (error) {
            init({message: 'Logout failed', color: 'danger'})
            return false;
        }

        galleryListStore.reset()

        return true;
    }

    const profile = ref<Profile | null>(null)

    async function refreshCurrentUserProfile(): Promise<void> {
        const currentUser = await me()
        if (!currentUser) {
            profile.value = null;
            return;
        }

        const {data, error} = await supabasePort
            .from('profiles')
            .select()
            .eq('user_id', currentUser.id)

        if (error || !data) {
            init({
                message: `Failed to fetch current user profile`,
                color: 'danger'
            })

            profile.value = null;

            return;
        }

        profile.value = data[0];
    }

    async function registerOnAuthStateChange(): Promise<void> {
        supabasePort.auth.onAuthStateChange(
            (event: AuthChangeEvent, session: Session | null) => {
                refreshCurrentUserProfile();

                const isNotAuthenticated: boolean = !(session?.user);

                if (isNotAuthenticated) {
                    router.push({
                        name: AuthRouteName.LOGIN
                    })
                }
            }
        );
    }

    async function updateCurrentUserProfile(profileDetail: ProfileDetail): Promise<void> {
        if (profileDetail.password.length >= 8) {
            const {error} = await supabasePort.auth.updateUser({password: profileDetail.password})
            if (error) {
                init({
                    message: error.message.slice(0, -1), // remove the "." in the error message
                    color: 'danger'
                })
            }
        }

        const currentUser = await me()
        if (currentUser) {
            const {error} = await supabasePort
                .from('profiles')
                .update({
                    name: profileDetail.name
                })
                .eq('user_id', currentUser.id)

            if (error) {
                init({
                    message: `Failed to update username`,
                    color: 'danger'
                })
            }
        }

        await refreshCurrentUserProfile()
    }

    return {
        profile,
        registerOnAuthStateChange,
        me,
        isCurrentlyAuthenticated,
        refreshCurrentUserProfile,
        updateCurrentUserProfile,
        signIn,
        signOut
    }
})