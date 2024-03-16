<script setup lang="ts">
type NavItemDataValue = 'history' | 'category' | 'summary'

type NavItemData = { value: NavItemDataValue, label: string }

const props = defineProps<{
  activePage: NavItemDataValue
}>()

const navItemDataList: NavItemData[] = [
  {
    value: 'history',
    label: 'History'
  },
  {
    value: 'category',
    label: 'Category'
  },
  {
    value: 'summary',
    label: 'Summary'
  }
];

</script>

<template>

  <va-navbar fixed color="background-element" class="h-16">
    <template #center>
      <va-navbar-item
          v-for="data in navItemDataList"
          :key="data.value"
          :class="{ 'is-active-page': activePage === data.value }"
      >
        {{ data.label }}
      </va-navbar-item>
    </template>
  </va-navbar>

  <div class="mt-16">
    <slot/>
  </div>

</template>

<style scoped>
.is-active-page {
  color: var(--va-primary);
}
</style>