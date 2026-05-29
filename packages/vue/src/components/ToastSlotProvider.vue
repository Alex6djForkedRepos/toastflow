<script setup lang="ts">
import { inject, toRefs } from "vue";
import type {
  ToastId,
  ToastInstance,
  ToastStandaloneInstance,
  ToastStore,
} from "toastflow-core";
import { toastStoreKey } from "../symbols";
import { getToastStore } from "../toast";
import { useToastUI } from "../toast-ui";

const props = defineProps<{
  toast: ToastStandaloneInstance | ToastInstance;
  progressResetKey?: number;
  duplicateKey?: number;
  updateKey?: number;
  bumpAnimationClass?: string;
  clearAllAnimationClass?: string;
  updateAnimationClass?: string;
}>();

const {
  toast: toastProp,
  progressResetKey,
  duplicateKey,
  updateKey,
  bumpAnimationClass,
  clearAllAnimationClass,
  updateAnimationClass,
} = toRefs(props);

const injectedStore = inject<ToastStore | null>(toastStoreKey, null);
const store: ToastStore = injectedStore ?? getToastStore();

function dismiss(id: ToastId) {
  store.dismiss(id);
}

const { toast, ui } = useToastUI({
  toast: toastProp,
  store,
  progressResetKey,
  duplicateKey,
  updateKey,
  onDismiss: dismiss,
  bumpAnimationClass,
  clearAllAnimationClass,
  updateAnimationClass,
});
</script>

<template>
  <slot
    :toast="toast"
    :progressResetKey="progressResetKey"
    :duplicateKey="duplicateKey"
    :updateKey="updateKey"
    :bumpAnimationClass="bumpAnimationClass"
    :clearAllAnimationClass="clearAllAnimationClass"
    :updateAnimationClass="updateAnimationClass"
    :dismiss="dismiss"
    :ui="ui"
  />
</template>
