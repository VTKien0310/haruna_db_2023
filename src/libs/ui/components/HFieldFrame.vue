<script setup lang="ts">
import HProgressCircle from "./HProgressCircle.vue";
withDefaults(
  defineProps<{
    controlId: string;
    label?: string;
    errors: readonly string[];
    loading?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    filled?: boolean;
    count?: number;
  }>(),
  { loading: false, disabled: false, readonly: false },
);
</script>

<template>
  <div class="h-ui h-text-field text-on-surface inline-flex min-w-0 flex-col">
    <div
      class="h-field-control flex min-w-0 flex-1 items-center gap-2"
      :class="{
        'h-field-readonly': readonly,
        'h-field-disabled': disabled,
        'h-field-filled': filled,
      }"
      :aria-invalid="errors.length > 0"
      :aria-busy="loading"
    >
      <label v-if="label" :for="controlId" class="h-control-label">{{
        label
      }}</label>
      <slot />
      <HProgressCircle
        v-if="loading"
        class="mt-3 self-start"
        size="small"
        indeterminate
        aria-label="Loading"
      />
    </div>
    <div
      v-if="errors.length"
      :id="`${controlId}-errors`"
      class="text-error text-body-small mt-1"
      role="alert"
    >
      <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
    </div>
    <span
      v-if="count !== undefined"
      class="text-on-surface-variant text-body-small mt-1 text-right"
      >{{ count }}</span
    >
  </div>
</template>
