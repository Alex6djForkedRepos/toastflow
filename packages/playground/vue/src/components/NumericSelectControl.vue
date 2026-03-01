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
    name?: string;
    autocomplete?: string;
  }>(),
  {
    step: 1,
    autocomplete: 'off',
    name: '',
  },
);

const emit = defineEmits<{
  'update:value': [number];
}>();

const selectId = `numeric-select-${Math.random().toString(36).slice(2, 9)}`;

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

const nameAttr = computed(function () {
  if (props.name?.trim()) {
    return props.name.trim();
  }
  return props.label.toLowerCase().replace(/\s+/g, '-');
});

const autocompleteAttr = computed(function () {
  return props.autocomplete ?? 'off';
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="selectId" class="text-[0.7rem] text-slate-500 dark:text-slate-400">
      {{ label }}
    </label>
    <div class="flex items-center gap-2">
      <Button variant="subtle" tooltip="Decrease" @click="decrement">-</Button>
      <select
        :id="selectId"
        :name="nameAttr"
        :autocomplete="autocompleteAttr"
        :value="value"
        class="ui-field p-1.5"
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
