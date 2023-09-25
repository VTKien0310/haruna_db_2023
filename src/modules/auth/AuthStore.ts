import {defineStore} from "pinia";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import type {AuthChangeEvent, Session, User} from "@supabase/supabase-js";
import router from "@/router";
import {AuthRouteName} from "@/modules/auth/AuthRouter";

export const useAuthStore = defineStore('auth', () => {
    async function registerOnAuthStateChange(): Promise<void> {
        supabasePort.auth.onAuthStateChange(
            (event: AuthChangeEvent, session: Session | null) => {
                const isNotAuthenticated: boolean = !session;

                if (isNotAuthenticated) {
                    router.push({
                        name: AuthRouteName.LOGIN
                    })
                }
            }
        );
    }

    async function me(): Promise<User | null> {
        const {data} = await supabasePort.auth.getUser();

        return data.user
    }

    async function isCurrentlyAuthenticated(): Promise<boolean> {
        const {data: {session},} = await supabasePort.auth.getSession();

        return session != null;
    }

    return {
        registerOnAuthStateChange,
        me,
        isCurrentlyAuthenticated
    }
})