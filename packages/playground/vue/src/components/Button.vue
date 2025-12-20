<script setup lang="ts">
import { computed } from 'vue';
import NewBadge from './NewBadge.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    variant?:
      | 'primary'
      | 'primary-muted'
      | 'outline'
      | 'danger'
      | 'subtle'
      | 'toggle'
      | 'pill'
      | 'ghost';
    isNew?: boolean;
  }>(),
  {
    variant: 'outline',
    isNew: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [boolean];
  click: [MouseEvent];
}>();

const isActive = computed(function () {
  return Boolean(props.modelValue);
});

const sizeClass = computed(function () {
  return 'px-3 py-1 text-[0.8rem]';
});

const shapeClass = computed(function () {
  if (props.variant === 'pill') {
    return 'rounded-full';
  }
  return 'rounded-xl';
});

const variantClass = computed(function () {
  const activeBase = 'border border-slate-900 bg-slate-900 text-white';
  const inactiveBase =
    'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100';

  switch (props.variant) {
    case 'primary':
      return 'bg-slate-900 text-white transition hover:bg-slate-800';
    case 'primary-muted':
      return 'bg-slate-900/80 text-white transition hover:bg-slate-900';
    case 'outline':
      return 'border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50';
    case 'danger':
      return 'border border-rose-200 bg-rose-50 text-rose-700 transition hover:border-rose-300 hover:bg-rose-100';
    case 'subtle':
      return 'border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100';
    case 'ghost':
      return 'text-slate-700 transition hover:bg-slate-100';
    case 'pill':
    case 'toggle':
      return isActive.value ? activeBase : inactiveBase;
    default:
      return inactiveBase;
  }
});

const baseClass = computed(function () {
  return 'inline-flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer';
});

const newBadgeClass = computed(function () {
  if (props.isNew) {
    return 'flex w-full items-center justify-between';
  }
  return '';
});

function onClick(event: MouseEvent) {
  if (props.modelValue !== undefined) {
    emit('update:modelValue', !props.modelValue);
  }
  emit('click', event);
}
</script>

<template>
  <button
    type="button"
    :class="[baseClass, sizeClass, shapeClass, variantClass, newBadgeClass]"
    @click="onClick"
  >
    <slot />
    <NewBadge v-if="isNew" />
  </button>
</template>
