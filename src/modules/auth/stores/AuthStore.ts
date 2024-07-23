import {defineStore} from 'pinia';
import type {Profile} from '@/modules/auth/ProfileEntities';
import {ref} from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<Profile | null>(null);

  return {
    profile,
  };
});
