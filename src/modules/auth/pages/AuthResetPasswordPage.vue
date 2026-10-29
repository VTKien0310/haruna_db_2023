<script setup lang="ts">
import { HButton, HForm, HInput, type HFormHandle } from "@/libs/ui";
import { computed, reactive, ref, watch } from "vue";
import type {
  PasswordResetAvailability,
  PasswordResetDetail,
} from "@/modules/auth/AuthTypes";
import { IonPage, onIonViewDidEnter } from "@ionic/vue";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";
import { useAuthStore } from "@/modules/auth/stores/AuthStore";
import logo from "@/assets/logo.svg";

const resetPasswordForm = ref<HFormHandle>();

const authenticationService = useAuthenticationService();
const authStore = useAuthStore();

const resetPasswordFormContent = reactive<PasswordResetDetail>({
  password: "",
  confirmPassword: "",
});

const availability = ref<PasswordResetAvailability | null>(null);
const isUpdatingPassword = ref<boolean>(false);

const enableResetButton = computed((): boolean => {
  const passwordIsLongEnough: boolean =
    resetPasswordFormContent.password.length >= 8;
  const confirmationMatches: boolean =
    resetPasswordFormContent.password ===
    resetPasswordFormContent.confirmPassword;

  return (
    passwordIsLongEnough && confirmationMatches && !isUpdatingPassword.value
  );
});

onIonViewDidEnter(async () => {
  const next = await authenticationService.preparePasswordReset();
  availability.value = authStore.passwordRecoveryRequired ? "ready" : next;
});

watch(
  () => authStore.passwordRecoveryRequired,
  (required: boolean) => {
    if (required) {
      availability.value = "ready";
    }
  },
);

function handleResetPassword() {
  if (!enableResetButton.value) {
    return;
  }

  isUpdatingPassword.value = true;
  authenticationService
    .resetPassword(resetPasswordFormContent.password)
    .then((isSuccess: boolean) => {
      isUpdatingPassword.value = false;
      if (isSuccess) {
        resetPasswordForm.value?.reset();
      }
    });
}

function requestNewResetLink() {
  authenticationService.openForgotPassword();
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
        v-if="availability === 'ready'"
        ref="resetPasswordForm"
        @submit.prevent="handleResetPassword"
        class="bg-background-secondary border-background-border mt-8 flex w-full max-w-sm flex-col items-center justify-center rounded-(--h-panel-radius) border p-6"
      >
        <h2 class="text-text-primary text-xl font-semibold">Reset password</h2>

        <h-input
          v-model="resetPasswordFormContent.password"
          label="New password"
          name="password"
          type="password"
          placeholder="Minimum length of 8 characters"
          class="mt-4 w-full"
        />

        <h-input
          v-model="resetPasswordFormContent.confirmPassword"
          label="Confirm password"
          name="confirmPassword"
          type="password"
          class="mt-4 w-full"
        />

        <h-button
          :disabled="!enableResetButton"
          :loading="isUpdatingPassword"
          type="submit"
          class="mt-6 w-full"
        >
          Update password
        </h-button>
      </h-form>

      <div
        v-else-if="availability === 'invalid'"
        class="bg-background-secondary border-background-border mt-8 flex w-full max-w-sm flex-col items-center justify-center rounded-(--h-panel-radius) border p-6"
      >
        <p class="text-text-primary text-center">
          This reset link is invalid or has expired.
        </p>

        <h-button
          type="button"
          class="mt-6 w-full"
          @click="requestNewResetLink"
        >
          Request a new link
        </h-button>
      </div>
    </div>
  </ion-page>
</template>
