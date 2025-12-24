<script setup lang="ts">
import { computed } from 'vue';

import Button from './Button.vue';

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    options: number[];
    step?: number;
    min?: number;
  }>(),
  {
    step: 1,
  },
);

const emit = defineEmits<{
  'update:value': [number];
}>();

const selectOptions = computed(function () {
  const base = Array.from(new Set([0, ...props.options, props.value])).sort((a, b) => a - b);
  return base.map((option) => ({
    value: option,
    label: option === 0 ? 'Unlimited' : String(option),
  }));
});

function clampValue(v: number) {
  if (props.min !== undefined) {
    return Math.max(props.min, v);
  }
  return v;
}

function onSelectChange(event: Event) {
  const raw = Number((event.target as HTMLSelectElement).value);
  emit('update:value', clampValue(raw));
}

function decrement() {
  emit('update:value', clampValue(props.value - props.step));
}

function increment() {
  emit('update:value', clampValue(props.value + props.step));
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <span class="text-[0.7rem] text-slate-500">{{ label }}</span>
    <div class="flex items-center gap-2">
      <Button variant="subtle" tooltip="Decrease" @click="decrement">-</Button>
      <select
        :value="value"
        class="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
        @change="onSelectChange"
      >
        <option v-for="option in selectOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <Button variant="subtle" tooltip="Increase" @click="increment">+</Button>
    </div>
  </div>
</template>
