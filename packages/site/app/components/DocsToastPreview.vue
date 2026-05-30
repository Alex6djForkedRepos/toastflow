<script setup lang="ts">
import { computed, provide, ref, type InjectionKey } from "vue";
import {
  createToastStore,
  toast,
  ToastContainer,
  type ToastId,
  type ToastStore,
} from "vue-toastflow";

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
const stylingPreviewStore = createToastStore({
  duration: 6500,
  position: "top-right",
  progressBar: true,
  width: "350px",
});
const toastStoreKey = Symbol.for(
  "vue-toastflow.toast-store",
) as InjectionKey<ToastStore>;

provide(toastStoreKey, stylingPreviewStore);
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
      return "Buttons mirror the global variables, theme class, and inline css examples above.";
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

function showGlobalStyledToast() {
  stylingPreviewStore.show({
    type: "info",
    title: "Global variables",
    description: "Font, radius, and color tokens from :root.",
  });
}

function showStyledToast() {
  stylingPreviewStore.show({
    type: "info",
    title: "Release",
    description: "v1.0.0 is out.",
    theme: "brand",
  });
}

function showInlineStyledToast() {
  stylingPreviewStore.show({
    type: "custom",
    title: "Runtime accent",
    description: "One-off color override, inherited global structure.",
    css: {
      bg: "#450a0a",
      color: "#fff1f2",
      titleColor: "#ffe4e6",
      descriptionColor: "#fecdd3",
      borderColor: "#fb7185",
      iconColor: "#fbbf24",
      progressBg: "color-mix(in srgb, #fbbf24 20%, transparent)",
      progressBarBg: "#fbbf24",
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
        <UButton icon="i-tabler-world" @click="showGlobalStyledToast">
          Global variables
        </UButton>
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

    <div v-if="props.variant === 'styling'" class="docs-styling-toast-scope">
      <ToastContainer />
    </div>
  </UCard>
</template>

<style>
.docs-styling-toast-scope {
  --tf-toast-font-family:
    "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  --tf-toast-border-radius: 4px;
  --tf-toast-padding: 18px;
  --tf-toast-bg: #fff7ed;
  --tf-toast-color: #431407;
  --tf-toast-title-color: #431407;
  --tf-toast-description-color: #7c2d12;
  --tf-toast-border-color: #fb923c;
  --tf-toast-icon-color: #ea580c;
  --tf-toast-progress-bg: color-mix(in srgb, #ea580c 18%, transparent);
  --tf-toast-progress-bar-bg: #ea580c;
}

.tf-toast-accent--brand {
  --tf-toast-bg: #ecfeff;
  --tf-toast-color: #164e63;
  --tf-toast-border-color: #67e8f9;
  --tf-toast-title-color: #0e7490;
  --tf-toast-description-color: #155e75;
  --tf-toast-progress-bg: color-mix(in srgb, #0891b2 20%, transparent);
  --tf-toast-progress-bar-bg: #0891b2;
  --tf-toast-icon-color: #0891b2;
}
</style>
