<script setup lang="ts">
import {useForm} from 'vuestic-ui';
import {computed, reactive, ref} from 'vue';
import {useAuthStore} from "@/modules/auth/stores/AuthStore";
import type {AuthCredential} from "@/modules/auth/AuthTypes";

const {reset} = useForm('loginForm');

const authStore = useAuthStore();

const loginFormContent = reactive<AuthCredential>({
  email: '',
  password: '',
});

const enableLoginButton = computed((): boolean => {
  const emailHasBeenInput: boolean = (loginFormContent.email && loginFormContent.email.length > 0) as boolean;
  const passwordHasBeenInput: boolean = (loginFormContent.password && loginFormContent.password.length > 0) as boolean;
  return emailHasBeenInput && passwordHasBeenInput;
});

const isHandlingLogin = ref<boolean>(false);

function handleLogin() {
  isHandlingLogin.value = true;
  authStore.signIn(loginFormContent).then((isSuccess: boolean) => {
    isHandlingLogin.value = false;
    if (isSuccess) {
      reset();
    }
  });
}
</script>

<template>
  <div class="flex flex-col justify-center items-center content-center min-h-screen w-full">
    <h1 class="branding-font font-bold text-center text-4xl text-primary w-full">HARUNA</h1>

    <va-form
        ref="loginForm"
        tag="form"
        @submit.prevent="handleLogin"
        class="flex flex-col justify-center items-center content-center w-2/3 sm:w-1/2 md:w-1/4 mt-12"
    >

      <va-input
          v-model="loginFormContent.email"
          label="Email"
          name="email"
          class="w-full"
      />

      <va-input
          v-model="loginFormContent.password"
          label="Password"
          name="password"
          class="mt-2 w-full"
      />

      <va-button
          :disabled="!enableLoginButton"
          :loading="isHandlingLogin"
          type="submit"
          gradient
          class="mt-6 w-full"
      >
        Login
      </va-button>

    </va-form>
  </div>
</template>

<style scoped>

</style>
