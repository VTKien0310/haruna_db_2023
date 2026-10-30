<script setup lang="ts">
import { HButton, HForm, HInput, type HFormHandle } from "@/libs/ui";
import { computed, reactive, ref } from "vue";
import type { AuthCredential } from "@/modules/auth/AuthTypes";
import { IonPage } from "@ionic/vue";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";
import { t } from "@/modules/auth/locales";
import logo from "@/assets/logo.svg";

const loginForm = ref<HFormHandle>();

const authenticationService = useAuthenticationService();

const loginFormContent = reactive<AuthCredential>({
  email: "",
  password: "",
});

const enableLoginButton = computed((): boolean => {
  const emailHasBeenInput: boolean = (loginFormContent.email &&
    loginFormContent.email.length > 0) as boolean;
  const passwordHasBeenInput: boolean = (loginFormContent.password &&
    loginFormContent.password.length > 0) as boolean;
  return emailHasBeenInput && passwordHasBeenInput;
});

const isHandlingLogin = ref<boolean>(false);

function handleLogin() {
  isHandlingLogin.value = true;
  authenticationService.signIn(loginFormContent).then((isSuccess: boolean) => {
    isHandlingLogin.value = false;
    if (isSuccess) {
      loginForm.value?.reset();
    }
  });
}
</script>

<template>
  <ion-page>
    <div
      class="bg-background-primary flex h-full w-full flex-col items-center justify-center overflow-y-auto px-4 py-8"
    >
      <div class="text-primary flex items-center gap-3">
        <img :src="logo" alt="" class="h-14 w-14" />
        <h1 class="text-3xl font-semibold">Haruna</h1>
      </div>

      <h-form
        ref="loginForm"
        @submit.prevent="handleLogin"
        class="bg-background-secondary border-background-border mt-8 flex w-full max-w-sm flex-col items-center justify-center rounded-(--h-panel-radius) border p-6"
      >
        <h-input
          v-model="loginFormContent.email"
          :label="t('emailLabel')"
          name="email"
          class="w-full"
        />

        <h-input
          v-model="loginFormContent.password"
          :label="t('passwordLabel')"
          name="password"
          type="password"
          class="mt-4 w-full"
        />

        <h-button
          :disabled="!enableLoginButton"
          :loading="isHandlingLogin"
          type="submit"
          class="mt-6 w-full"
        >
          {{ t("loginButton") }}
        </h-button>

        <h-button
          type="button"
          variant="quiet"
          class="mt-2 w-full"
          @click="authenticationService.openForgotPassword()"
        >
          {{ t("forgotPasswordLink") }}
        </h-button>
      </h-form>
    </div>
  </ion-page>
</template>

<style scoped></style>
