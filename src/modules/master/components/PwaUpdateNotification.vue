<script setup lang="ts">
import { HButton, HModal } from "@/libs/ui";

import { usePwaUpdateStore } from "@/modules/master/stores/PwaUpdateStore";
import { t } from "@/modules/master/locales";

const pwaUpdateStore = usePwaUpdateStore();

const handleUpdate = async (): Promise<void> => {
  await pwaUpdateStore.updateServiceWorker?.();
};
</script>

<template>
  <h-modal
    :model-value="pwaUpdateStore.needRefresh"
    :title="t('elements.pwaUpdateTitle')"
    hide-default-actions
    no-dismiss
    no-outside-dismiss
    no-esc-dismiss
  >
    <p>
      {{ t("messages.pwaUpdateBody") }}
    </p>

    <div class="mt-4 flex justify-end">
      <h-button color="primary" @click="handleUpdate">
        {{ t("elements.pwaUpdateRestart") }}
      </h-button>
    </div>
  </h-modal>
</template>
