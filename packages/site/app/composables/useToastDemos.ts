import { ref } from "vue";
import { toast } from "vue-toastflow";

/**
 * Demo toast actions shared by the docs preview components.
 */
export function useToastDemos() {
  const isLoading = ref(false);

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

  return { isLoading, showActionToast, showLoadingToast };
}
