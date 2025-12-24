<script setup lang="ts">
import NewBadge from './NewBadge.vue';

const props = defineProps<{
  text: string;
  isNew?: boolean;
}>();
</script>

<template>
  <h2
    class="mb-3 flex items-center justify-between gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
  >
    {{ text }}
    <NewBadge v-if="isNew" />
    <slot></slot>
  </h2>
</template>
