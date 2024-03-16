import type {RouteRecordRaw} from "vue-router";

export enum FinanceRouteName {
    LIST = 'finance.list'
}

const financeRouter: RouteRecordRaw[] = [
    {
        path: '/finance',
        name: FinanceRouteName.LIST,
        component: () => import('@/modules/finance/pages/TransactionListPage.vue')
    }
]

export default financeRouter