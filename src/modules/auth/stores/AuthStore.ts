import { defineStore } from "pinia";
import type {
  Profile,
  UserSpecialPermission,
} from "@/modules/auth/AuthEntities";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const profile = ref<Profile | null>(null);
  const userSpecialPermissions = ref<UserSpecialPermission[]>([]);
  const passwordRecoveryRequired = ref<boolean>(false);

  return {
    profile,
    userSpecialPermissions,
    passwordRecoveryRequired,
  };
});
