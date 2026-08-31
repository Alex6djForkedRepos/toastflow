<script setup lang="ts">
import { toast } from "vue-toastflow";

const { isLoading, showActionToast, showLoadingToast } = useToastDemos();

function showSuccessToast() {
  toast.success({
    title: "Saved",
    description: "This toast came from a live docs example.",
  });
}
</script>

<template>
  <UCard>
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-sm font-medium text-highlighted">Try it live</p>
        <p class="mt-1 text-sm text-muted">
          These buttons use the same Toastflow runtime as your app.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton icon="i-tabler-check" @click="showSuccessToast">
          Success toast
        </UButton>
        <UButton
          icon="i-tabler-loader-2"
          variant="subtle"
          :loading="isLoading"
          @click="showLoadingToast"
        >
          Async toast
        </UButton>
        <UButton
          icon="i-tabler-hand-click"
          variant="outline"
          @click="showActionToast"
        >
          Action toast
        </UButton>
      </div>
    </div>
  </UCard>
</template>
