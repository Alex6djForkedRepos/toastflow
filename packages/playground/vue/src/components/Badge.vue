<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'new' | 'brand';
  }>(),
  {
    variant: 'brand',
  },
);

const variantClass = computed(function () {
  if (props.variant === 'brand') {
    return 'ui-brand-pill';
  }

  return 'inline-flex items-center rounded-full bg-amber-200 px-2 py-[2px] text-[0.65rem] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/25 dark:text-amber-300';
});
</script>

<template>
  <span :class="variantClass">
    <slot name="icon" />
    <slot />
  </span>
</template>
