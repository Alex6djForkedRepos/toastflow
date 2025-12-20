<script setup lang="ts">
import type { ToastProgressAlignment, ToastType } from "toastflow-core";

const props = withDefaults(
  defineProps<{
    type: ToastType;
    progressAlignment?: ToastProgressAlignment;
  }>(),
  {
    progressAlignment: "right-to-left",
  },
);
</script>

<template>
  <div class="tf-toast-progress" :data-align="props.progressAlignment">
    <div
      class="tf-toast-progress-bar"
      :class="`tf-toast-progress-bar--${props.type}`"
    />
  </div>
</template>

<style scoped>
.tf-toast-progress {
  height: var(--tf-toast-progress-height);
  width: 100%;
  border-radius: 0 0 var(--tf-toast-radius) var(--tf-toast-radius);
  background: var(--tf-toast-progress-bg);
}

.tf-toast-progress-bar {
  height: 100%;
  animation-name: tf-toast-progress-rtl;
  animation-duration: var(--tf-toast-progress-duration, 5000ms);
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.tf-toast-progress[data-align="left-to-right"] .tf-toast-progress-bar {
  width: 0;
  animation-name: tf-toast-progress-ltr;
}

.tf-toast-progress-bar--default {
  background: var(--tf-toast-accent-default);
}

.tf-toast-progress-bar--success {
  background: var(--tf-toast-accent-success);
}

.tf-toast-progress-bar--error {
  background: var(--tf-toast-accent-error);
}

.tf-toast-progress-bar--warning {
  background: var(--tf-toast-accent-warning);
}

.tf-toast-progress-bar--info {
  background: var(--tf-toast-accent-info);
}

@keyframes tf-toast-progress-rtl {
  from {
    width: 100%;
  }
  to {
    width: 0;
  }
}

@keyframes tf-toast-progress-ltr {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
</style>
