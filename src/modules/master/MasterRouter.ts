import type {RouteRecordRaw} from "vue-router";

const masterRouter: RouteRecordRaw = {
    path: '/',
    name: 'master',
    component: () => import('@/modules/master/pages/MasterPage.vue')
}

export default masterRouter