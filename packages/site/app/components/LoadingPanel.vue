<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    minHeight?: string;
    plain?: boolean;
  }>(),
  {
    label: "Loading…",
    minHeight: "",
    plain: false,
  },
);
</script>

<template>
  <div
    class="flex w-full items-center justify-center"
    :class="
      plain
        ? undefined
        : 'rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
    "
    :style="minHeight ? { minHeight } : undefined"
  >
    <div class="flex flex-col items-center gap-3 text-slate-400">
      <svg class="size-6 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span class="text-sm">{{ label }}</span>
    </div>
  </div>
</template>
