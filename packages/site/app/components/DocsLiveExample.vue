<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-toastflow";

const isLoading = ref(false);

function showSuccessToast() {
  toast.success({
    title: "Saved",
    description: "This toast came from a live docs example.",
  });
}

function showActionToast() {
  toast.info({
    title: "File archived",
    description: "Use an action when the user can immediately recover.",
    buttons: {
      alignment: "bottom-right",
      buttons: [
        {
          label: "Undo",
          dismissAfterClick: true,
          onClick() {
            toast.success({ title: "Restored" });
          },
        },
      ],
    },
  });
}

async function showLoadingToast() {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  try {
    await toast.loading(
      new Promise((resolve) => window.setTimeout(resolve, 900)),
      {
        loading: { title: "Saving" },
        success: { title: "Saved" },
        error: { title: "Failed" },
      },
    );
  } finally {
    isLoading.value = false;
  }
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
