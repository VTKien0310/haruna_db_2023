<script setup lang="ts">
import { VaButton, VaModal } from "vuestic-ui";

import { usePwaUpdateStore } from "@/modules/master/stores/PwaUpdateStore";

const pwaUpdateStore = usePwaUpdateStore();

const handleUpdate = async (): Promise<void> => {
  await pwaUpdateStore.updateServiceWorker?.();
};
</script>

<template>
  <va-modal
    :model-value="pwaUpdateStore.needRefresh"
    title="Update Available"
    hide-default-actions
    no-dismiss
    no-outside-dismiss
    no-esc-dismiss
  >
    <p>
      A new version of the app is available. Please restart the app to apply the
      update.
    </p>

    <div class="mt-4 flex justify-end">
      <va-button color="primary" @click="handleUpdate">Restart App</va-button>
    </div>
  </va-modal>
</template>
