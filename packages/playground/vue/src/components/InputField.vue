<script setup lang="ts">
import CardLayout from '@/components/card/CardLayout.vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    modelValue: string | number;
    placeholder?: string;
    type?: 'text' | 'number';
    options?: { label: string; value: string | number }[];
    min?: number;
    step?: number;
  }>(),
  {
    type: 'text',
    placeholder: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [string | number];
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const raw = target.value;
  if (props.type === 'number') {
    const parsed = Number(raw);
    emit('update:modelValue', Number.isNaN(parsed) ? 0 : parsed);
  } else {
    emit('update:modelValue', raw);
  }
}

function onSelect(event: Event) {
  const target = event.target as HTMLSelectElement;
  const raw = target.value;
  emit('update:modelValue', raw);
}

function getInputId() {
  return `field-${Math.random().toString(36).slice(2, 9)}`;
}

const inputId = getInputId();
</script>

<template>
  <CardLayout>
    <label v-if="label" :for="inputId" class="text-[0.7rem] text-slate-500">{{ label }}</label>
    <select
      v-if="options"
      :id="inputId"
      :value="modelValue"
      class="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
      @change="onSelect"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <input
      v-else
      :id="inputId"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :min="min"
      :step="step"
      class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
      @input="onInput"
    />
  </CardLayout>
</template>
