<script setup lang="ts">

import {IonPage} from "@ionic/vue";
import TransactionModulePageLayout from "@/modules/finance/layouts/TransactionModulePageLayout.vue";
import {reactive} from "vue";
import {type TransactionCreationData, TransactionType} from "@/modules/finance/FinanceTypes";
import {useTransactionCreateStore} from "@/modules/finance/stores/TransactionCreateStore";

const transactionCreateStore = useTransactionCreateStore();

const newTransactionData = reactive<TransactionCreationData>({
  name: '',
  amount: 0,
  type: TransactionType.CASH_OUT
});

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
              v-model="newTransactionData.name"
              label="Name"
              name="name"
              class="w-full"
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