<script setup lang="ts">
import { computed, ref } from "vue";
import { toast, type ToastId } from "vue-toastflow";

type PreviewVariant =
  | "create"
  | "buttons"
  | "import"
  | "loading"
  | "styling"
  | "timers"
  | "update";

const props = withDefaults(
  defineProps<{
    variant?: PreviewVariant;
  }>(),
  {
    variant: "create",
  },
);

const isLoading = ref(false);
const updateId = ref<ToastId | null>(null);
const previewDescription = computed(() => {
  switch (props.variant) {
    case "create":
      return "Buttons mirror the three create call styles shown above.";
    case "buttons":
      return "Button mirrors the action-button example shown above.";
    case "import":
      return "Button mirrors the loading helper import example above with a local promise.";
    case "loading":
      return "Button mirrors the loading helper example shown above.";
    case "styling":
      return "Buttons mirror the theme class and inline css examples above. Global variables are app-wide.";
    case "timers":
      return "Button mirrors the timed progress-bar example shown above.";
    case "update":
      return "Button mirrors the show + update example shown above.";
    default:
      return "Runs against the same Toastflow runtime used by the docs.";
  }
});

function showPayloadObject() {
  toast.show({
    type: "success",
    title: "Saved",
    description: "Done",
  });
}

function showTitleOptions() {
  toast.show("Saved", {
    type: "success",
    description: "Done",
  });
}

function showTypedHelper() {
  toast.success({
    title: "Saved",
    description: "Done",
  });
}

function showActionToast() {
  toast.info({
    title: "File archived",
    description: "Use an action when the user can recover immediately.",
    buttons: {
      alignment: "bottom-right",
      buttons: [
        {
          id: "undo",
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

async function showImportToast() {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  try {
    await toast.loading(
      new Promise<{ count: number }>((resolve) => {
        window.setTimeout(() => resolve({ count: 12 }), 900);
      }),
      {
        loading: { title: "Importing", description: "Processing file" },
        success: (data) => ({
          title: "Import complete",
          description: `${data.count} records saved`,
          duration: 6000,
        }),
        error: (err) => ({
          title: "Import failed",
          description: err instanceof Error ? err.message : "Unknown error",
          duration: 10000,
        }),
      },
    );
  } finally {
    isLoading.value = false;
  }
}

function showTimedToast() {
  toast.info({
    title: "Uploading",
    duration: 8000,
    progressBar: true,
    progressAlignment: "left-to-right",
  });
}

function showStyledToast() {
  toast.info({
    title: "Release",
    description: "v1.0.0 is out.",
    theme: "brand",
  });
}

function showInlineStyledToast() {
  toast.custom({
    title: "Custom accent",
    description: "One-off runtime style.",
    css: {
      bg: "#0f172a",
      color: "#f8fafc",
      borderColor: "#334155",
      iconColor: "#f8fafc",
    },
  });
}

function showUpdateToast() {
  updateId.value = toast.show({
    type: "loading",
    title: "Uploading",
    description: "Waiting for the update call...",
    duration: 0,
    progressBar: false,
  });

  window.setTimeout(() => {
    if (!updateId.value) {
      return;
    }

    toast.update(updateId.value, {
      type: "success",
      title: "Upload complete",
      description: "The same toast id was patched in place.",
      duration: 3500,
      progressBar: true,
    });
  }, 900);
}
</script>

<template>
  <UCard>
    <div class="flex flex-col gap-3">
      <div>
        <p class="text-sm font-medium text-highlighted">Try this example</p>
        <p class="mt-1 text-sm text-muted">
          {{ previewDescription }}
        </p>
      </div>

      <div v-if="props.variant === 'create'" class="flex flex-wrap gap-2">
        <UButton icon="i-tabler-box" @click="showPayloadObject">
          Payload object
        </UButton>
        <UButton
          icon="i-tabler-heading"
          variant="subtle"
          @click="showTitleOptions"
        >
          Title + options
        </UButton>
        <UButton
          icon="i-tabler-circle-check"
          variant="outline"
          @click="showTypedHelper"
        >
          Helper
        </UButton>
      </div>

      <div v-else-if="props.variant === 'buttons'" class="flex flex-wrap gap-2">
        <UButton icon="i-tabler-hand-click" @click="showActionToast">
          Action toast
        </UButton>
      </div>

      <div v-else-if="props.variant === 'import'" class="flex flex-wrap gap-2">
        <UButton
          icon="i-tabler-database-import"
          :loading="isLoading"
          @click="showImportToast"
        >
          Run import flow
        </UButton>
      </div>

      <div v-else-if="props.variant === 'loading'" class="flex flex-wrap gap-2">
        <UButton
          icon="i-tabler-loader-2"
          :loading="isLoading"
          @click="showLoadingToast"
        >
          Run loading flow
        </UButton>
      </div>

      <div v-else-if="props.variant === 'timers'" class="flex flex-wrap gap-2">
        <UButton icon="i-tabler-progress" @click="showTimedToast">
          Show timed toast
        </UButton>
      </div>

      <div v-else-if="props.variant === 'styling'" class="flex flex-wrap gap-2">
        <UButton icon="i-tabler-palette" @click="showStyledToast">
          Theme class
        </UButton>
        <UButton
          icon="i-tabler-brush"
          variant="outline"
          @click="showInlineStyledToast"
        >
          Inline css
        </UButton>
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <UButton icon="i-tabler-refresh" @click="showUpdateToast">
          Show + update
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<style>
.tf-toast-accent--brand {
  --tf-toast-bg: #101828;
  --tf-toast-color: #f8fafc;
  --tf-toast-border-color: #1f2937;
  --tf-toast-progress-bg: color-mix(in srgb, #10b981 20%, transparent);
  --tf-toast-progress-bar-bg: #10b981;
  --tf-toast-icon-color: #10b981;
}
</style>
