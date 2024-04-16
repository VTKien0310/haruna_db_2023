import type {RouteRecordRaw} from "vue-router";

export enum TranslationRouteName {
    TRANSLATION = 'translation',
}

const translationRouter: RouteRecordRaw[] = [
    {
        path: '/translation',
        name: TranslationRouteName.TRANSLATION,
        component: () => import('@/modules/translation/pages/TranslationPage.vue')
    }
]

export default translationRouter