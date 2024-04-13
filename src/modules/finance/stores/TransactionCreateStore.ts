import {defineStore} from "pinia";
import {ref} from "vue";

export const useTransactionCreateStore = defineStore('transaction-create', () => {
    const collapseCreateForm = ref<boolean>(false)

    function reset() {
        collapseCreateForm.value = false
    }

    return {
        collapseCreateForm,
        reset
    }
})