<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import HButton from "./HButton.vue";

type PaginationItem =
  | { type: "page"; page: number; key: string }
  | { type: "ellipsis"; key: string };

const WIDE_VIEWPORT_QUERY = "(min-width: 640px)";
const BOUNDARY_COUNT = 1;

const props = withDefaults(
  defineProps<{ modelValue: number; pages: number; disabled?: boolean }>(),
  { disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [value: number] }>();

const total = computed(() => Math.max(0, Math.floor(props.pages)));
const currentPage = computed(() =>
  total.value > 0
    ? Math.min(Math.max(1, Math.floor(props.modelValue)), total.value)
    : 0,
);

const isWideViewport = ref(
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(WIDE_VIEWPORT_QUERY).matches
    : true,
);
let mediaQueryList: MediaQueryList | null = null;

function handleViewportChange(event: MediaQueryListEvent) {
  isWideViewport.value = event.matches;
}

onMounted(() => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return;
  }
  mediaQueryList = window.matchMedia(WIDE_VIEWPORT_QUERY);
  isWideViewport.value = mediaQueryList.matches;
  mediaQueryList.addEventListener("change", handleViewportChange);
});

onBeforeUnmount(() => {
  mediaQueryList?.removeEventListener("change", handleViewportChange);
  mediaQueryList = null;
});

function range(start: number, end: number): number[] {
  return start > end
    ? []
    : Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

const items = computed<PaginationItem[]>(() => {
  const count = total.value;
  if (count <= 0) return [];

  const siblingCount = isWideViewport.value ? 1 : 0;
  const startPages = range(1, Math.min(BOUNDARY_COUNT, count));
  const endPages = range(
    Math.max(count - BOUNDARY_COUNT + 1, BOUNDARY_COUNT + 1),
    count,
  );

  const siblingsStart = Math.max(
    Math.min(
      currentPage.value - siblingCount,
      count - BOUNDARY_COUNT - siblingCount * 2 - 1,
    ),
    BOUNDARY_COUNT + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(
      currentPage.value + siblingCount,
      BOUNDARY_COUNT + siblingCount * 2 + 2,
    ),
    count - BOUNDARY_COUNT - 1,
  );

  const entries: (number | "start-ellipsis" | "end-ellipsis")[] = [
    ...startPages,
    ...(siblingsStart > BOUNDARY_COUNT + 2
      ? (["start-ellipsis"] as const)
      : BOUNDARY_COUNT + 1 < count - BOUNDARY_COUNT
        ? [BOUNDARY_COUNT + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - BOUNDARY_COUNT - 1
      ? (["end-ellipsis"] as const)
      : count - BOUNDARY_COUNT > BOUNDARY_COUNT
        ? [count - BOUNDARY_COUNT]
        : []),
    ...endPages,
  ];

  return entries.map((entry) =>
    typeof entry === "number"
      ? { type: "page", page: entry, key: `page-${entry}` }
      : { type: "ellipsis", key: entry },
  );
});

function select(value: number) {
  if (
    !props.disabled &&
    value >= 1 &&
    value <= total.value &&
    value !== props.modelValue
  ) {
    emit("update:modelValue", value);
  }
}
</script>

<template>
  <nav
    v-if="total > 0"
    class="h-ui h-pagination inline-flex max-w-full items-center"
    aria-label="Pagination"
    @keydown.left.prevent="select(currentPage - 1)"
    @keydown.right.prevent="select(currentPage + 1)"
    @keydown.up.prevent="select(currentPage - 1)"
    @keydown.down.prevent="select(currentPage + 1)"
    @keydown.home.prevent="select(1)"
    @keydown.end.prevent="select(total)"
  >
    <ul
      class="inline-flex max-w-full flex-nowrap items-center gap-0.5 sm:gap-1"
    >
      <li class="flex">
        <HButton
          class="h-pagination-control"
          icon="chevron_left"
          variant="text"
          aria-label="Previous page"
          :disabled="disabled || currentPage <= 1"
          @click="select(currentPage - 1)"
        />
      </li>
      <li v-for="item in items" :key="item.key" class="flex">
        <span
          v-if="item.type === 'ellipsis'"
          class="h-pagination-ellipsis text-on-surface-variant text-label-large inline-flex items-center justify-center select-none"
          :class="{ 'h-pagination-ellipsis-disabled': disabled }"
          aria-hidden="true"
          >&hellip;</span
        >
        <HButton
          v-else
          class="h-pagination-page"
          :aria-label="`Page ${item.page}`"
          :aria-current="item.page === currentPage ? 'page' : undefined"
          :variant="item.page === currentPage ? 'filled' : 'text'"
          :disabled="disabled"
          @click="select(item.page)"
          >{{ item.page }}</HButton
        >
      </li>
      <li class="flex">
        <HButton
          class="h-pagination-control"
          icon="chevron_right"
          variant="text"
          aria-label="Next page"
          :disabled="disabled || currentPage >= total"
          @click="select(currentPage + 1)"
        />
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.h-pagination :deep(.h-pagination-page) {
  min-width: 2.5rem;
  height: 2.5rem;
  padding-inline: 0.5rem;
  font-variant-numeric: tabular-nums;
}

.h-pagination :deep(.h-pagination-page.h-button-text:not(:disabled)) {
  color: var(--color-on-surface);
}

.h-pagination :deep(.h-pagination-control.h-button-text:not(:disabled)) {
  color: var(--color-on-surface-variant);
}

.h-pagination :deep(.h-button-text.h-button-disabled) {
  background: transparent;
}

.h-pagination :deep(.h-button)::before {
  width: 100%;
  height: max(100%, 3rem);
}

.h-pagination-ellipsis {
  min-width: 1.75rem;
  height: 2.5rem;
}

.h-pagination-ellipsis-disabled {
  color: var(--color-disabled-content);
}

@media (min-width: 640px) {
  .h-pagination-ellipsis {
    min-width: 2rem;
  }
}
</style>
