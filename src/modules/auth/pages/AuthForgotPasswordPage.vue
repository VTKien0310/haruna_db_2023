<script setup lang="ts">
import { HButton, HForm, HInput, type HFormHandle } from "@/libs/ui";
import { computed, reactive, ref } from "vue";
import type { PasswordResetRequest } from "@/modules/auth/AuthTypes";
import { IonPage } from "@ionic/vue";
import { useAuthenticationService } from "@/modules/auth/AuthServiceContainer";
import { t } from "@/modules/auth/locales";
import logo from "@/assets/logo.svg";

const forgotPasswordForm = ref<HFormHandle>();

const authenticationService = useAuthenticationService();

const forgotPasswordFormContent = reactive<PasswordResetRequest>({
  email: "",
});

const enableSendButton = computed((): boolean => {
  return (forgotPasswordFormContent.email &&
    forgotPasswordFormContent.email.length > 0) as boolean;
});

const isSendingResetEmail = ref<boolean>(false);

function handleSendResetEmail() {
  if (!enableSendButton.value || isSendingResetEmail.value) {
    return;
  }

  isSendingResetEmail.value = true;
  authenticationService
    .requestPasswordReset(forgotPasswordFormContent.email)
    .then((isSuccess: boolean) => {
      isSendingResetEmail.value = false;
      if (isSuccess) {
        forgotPasswordForm.value?.reset();
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
        ref="forgotPasswordForm"
        @submit.prevent="handleSendResetEmail"
        class="bg-background-secondary border-background-border mt-8 flex w-full max-w-sm flex-col items-center justify-center rounded-(--h-panel-radius) border p-6"
      >
        <h2 class="text-text-primary text-xl font-semibold">
          {{ t("forgotPasswordTitle") }}
        </h2>

        <h-input
          v-model="forgotPasswordFormContent.email"
          :label="t('emailLabel')"
          name="email"
          class="mt-4 w-full"
        />

        <h-button
          :disabled="!enableSendButton"
          :loading="isSendingResetEmail"
          type="submit"
          class="mt-6 w-full"
        >
          {{ t("sendResetLinkButton") }}
        </h-button>
      </h-form>
    </div>
  </ion-page>
</template>
