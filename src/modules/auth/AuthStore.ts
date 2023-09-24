import {defineStore} from "pinia";
import {supabasePort} from "@/ports/supabase/SupabasePort";
import type {AuthChangeEvent, Session} from "@supabase/supabase-js";
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

    return {
        registerOnAuthStateChange,
    }
})