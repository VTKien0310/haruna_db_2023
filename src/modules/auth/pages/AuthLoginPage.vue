<script setup lang="ts">
import { useForm, VaButton, VaForm, VaInput } from "vuestic-ui";
import { computed, reactive, ref } from "vue";
import type { AuthCredential } from "@/modules/auth/AuthTypes";
import { IonPage } from "@ionic/vue";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";

const { reset } = useForm("loginForm");

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
      reset();
    }
  });
}
</script>

<template>
  <ion-page>
    <div
      class="flex min-h-screen w-full flex-col content-center items-center justify-center"
    >
      <h1
        class="branding-font branding-color w-full text-center text-4xl font-bold"
      >
        HARUNA
      </h1>

      <va-form
        ref="loginForm"
        tag="form"
        @submit.prevent="handleLogin"
        class="mt-12 flex w-2/3 flex-col content-center items-center justify-center sm:w-1/2 md:w-1/4"
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
          type="password"
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
  </ion-page>
</template>

<style scoped></style>
