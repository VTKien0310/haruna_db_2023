import {defineStore} from "pinia";
import {reactive, ref} from "vue";
import type {TransactionCreationData} from "@/modules/finance/FinanceTypes";

export const useTransactionCreateStore = defineStore('transaction-create', () => {
    const collapseCreateForm = ref<boolean>(false)

    const newTransactionData = reactive<TransactionCreationData>({
        name: '',
        amount: 0,
        is_cash_out: true
    })

    function reset() {
        collapseCreateForm.value = false
        resetTransactionCreationData()
    }

    function resetTransactionCreationData(): void {
        newTransactionData.name = '';
        newTransactionData.amount = 0;
        newTransactionData.is_cash_out = true;
    }

    return {
        collapseCreateForm,
        newTransactionData,
        reset,
        resetTransactionCreationData
    }
})