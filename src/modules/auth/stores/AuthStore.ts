import {defineStore} from "pinia";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import type {AuthChangeEvent, Session, User} from "@supabase/supabase-js";
import router from "@/router";
import {AuthRouteName} from "@/modules/auth/AuthRouter";
import type {AuthCredential} from "@/modules/auth/AuthTypes";
import {useToast} from "vuestic-ui";
import {MasterRouteName} from "@/modules/master/MasterRouter";

export const useAuthStore = defineStore('auth', () => {
    const {init} = useToast();

    async function registerOnAuthStateChange(): Promise<void> {
        supabasePort.auth.onAuthStateChange(
            (event: AuthChangeEvent, session: Session | null) => {
                const isNotAuthenticated: boolean = !(session?.user);

                if (isNotAuthenticated) {
                    router.push({
                        name: AuthRouteName.LOGIN
                    })
                }
            }
        );
    }

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

    async function signOut(): Promise<boolean> {
        const {error} = await supabasePort.auth.signOut()

        if (error) {
            init({message: 'Logout failed', color: 'danger'})
            return false;
        }

        return true;
    }

    return {
        registerOnAuthStateChange,
        me,
        isCurrentlyAuthenticated,
        signIn,
        signOut
    }
})