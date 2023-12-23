import type {RouteRecordRaw} from "vue-router";

export enum MasterRouteName {
    MASTER = 'master'
}

const masterRouter: RouteRecordRaw = {
    path: '/',
    name: MasterRouteName.MASTER,
    component: () => import('@/modules/master/pages/MasterPage.vue')
}

export default masterRouter