<script setup lang="ts">
import { type Component, computed } from 'vue';

import Button from './Button.vue';

type ToggleOption<T> = {
  value: T;
  label: string;
  icon?: Component;
};

const props = withDefaults(
  defineProps<{
    options: ToggleOption<string>[];
    activeValue: string;
    columns?: number;
  }>(),
  {
    columns: 2,
  },
);

const emit = defineEmits<{
  'update:value': [string];
}>();

const gridClass = computed(function () {
  const colClass =
    props.columns === 3
      ? 'grid-cols-3'
      : props.columns === 4
        ? 'grid-cols-4'
        : props.columns === 1
          ? 'grid-cols-1'
          : 'grid-cols-2';
  return `grid ${colClass} gap-2`;
});
</script>

<template>
  <div :class="gridClass">
    <Button
      v-for="option in options"
      :key="option.value"
      variant="toggle"
      :model-value="activeValue === option.value"
      class="group flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[0.7rem] font-medium transition-colors transition-transform duration-200"
      :tooltip="option.label"
      @update:model-value="emit('update:value', option.value)"
    >
      <component v-if="option.icon" :is="option.icon" class="h-4 w-4 group-hover:scale-105" />
      <span class="text-[0.6rem] uppercase tracking-[0.16em]">
        {{ option.label }}
      </span>
    </Button>
  </div>
</template>
