<script setup lang="ts">
import { computed } from 'vue';
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
    name?: string;
    autocomplete?: string;
  }>(),
  {
    type: 'text',
    placeholder: '',
    autocomplete: 'off',
    name: '',
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
const nameAttr = computed(function () {
  if (props.name?.trim()) {
    return props.name.trim();
  }
  if (props.label?.trim()) {
    return props.label.trim().toLowerCase().replace(/\s+/g, '-');
  }
  return undefined;
});

const autocompleteAttr = computed(function () {
  return props.autocomplete ?? 'off';
});
</script>

<template>
  <CardLayout>
    <label v-if="label" :for="inputId" class="text-[0.7rem] text-slate-500 dark:text-slate-400">
      {{ label }}
    </label>
    <select
      v-if="options"
      :id="inputId"
      :name="nameAttr"
      :autocomplete="autocompleteAttr"
      :value="modelValue"
      class="ui-field"
      @change="onSelect"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <input
      v-else
      :id="inputId"
      :name="nameAttr"
      :autocomplete="autocompleteAttr"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :min="min"
      :step="step"
      :inputmode="type === 'number' ? 'decimal' : undefined"
      spellcheck="false"
      class="ui-field"
      @input="onInput"
    />
  </CardLayout>
</template>
