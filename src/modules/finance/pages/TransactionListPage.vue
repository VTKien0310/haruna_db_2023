<script setup lang="ts">

import {IonPage} from "@ionic/vue";
import TransactionModulePageLayout from "@/modules/finance/layouts/TransactionModulePageLayout.vue";
import {useTransactionCreateStore} from "@/modules/finance/stores/TransactionCreateStore";

const transactionCreateStore = useTransactionCreateStore();

</script>

<template>
  <ion-page>

    <TransactionModulePageLayout active-page="history">

      <va-collapse
          v-model="transactionCreateStore.collapseCreateForm"
          header="Add new history"
      >
        <va-form
            ref="creationForm"
            tag="form"
            class="flex flex-col justify-center items-center content-center w-full"
        >

          <va-input
              v-model="transactionCreateStore.newTransactionData.name"
              label="Name"
              name="name"
              class="w-full"
          />

          <va-radio
              v-model="transactionCreateStore.newTransactionData.is_cash_out"
              label="Type"
              name="type"
              :options="[
                  {
                    text: 'Out',
                    value: true
                  },
                  {
                    text: 'In',
                    value: false
                  }
              ]"
              value-by="value"
          />

        </va-form>
      </va-collapse>

      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
      <p>Placeholder</p>
    </TransactionModulePageLayout>

  </ion-page>
</template>

<style scoped>

</style>