<script setup lang="ts">
import { computed } from "vue";
import type { ToastProgressAlignment, ToastType } from "toastflow-core";

type ToastSlotProps = Record<string, unknown>;

const props = withDefaults(
  defineProps<{
    type?: ToastType;
    progressAlignment?: ToastProgressAlignment;
    trackProps?: ToastSlotProps;
    barProps?: ToastSlotProps;
  }>(),
  {
    type: "default",
    progressAlignment: "right-to-left",
  },
);

const resolvedTrackProps = computed(function (): ToastSlotProps {
  return (
    props.trackProps ?? {
      class: "tf-toast-progress",
      "data-align": props.progressAlignment,
    }
  );
});

const resolvedBarProps = computed(function (): ToastSlotProps {
  return (
    props.barProps ?? {
      class: ["tf-toast-progress-bar", `tf-toast-progress-bar--${props.type}`],
    }
  );
});
</script>

<template>
  <div v-bind="resolvedTrackProps">
    <div v-bind="resolvedBarProps" />
  </div>
</template>
