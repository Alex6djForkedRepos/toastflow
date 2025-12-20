<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    wrap?: boolean;
  }>(),
  {
    wrap: false,
  },
);
</script>

<template>
  <div :class="['flex gap-2', wrap ? 'flex-wrap' : 'flex-col']">
    <slot />
  </div>
</template>
