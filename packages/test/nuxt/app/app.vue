<template>
  <div class="app">
    <ToastContainer />
    <main class="panel">
      <h1>nuxt-toastflow smoke test</h1>

      <section>
        <h2>Basic types</h2>
        <div class="grid">
          <button type="button" @click="fireDefault">Default</button>
          <button type="button" @click="fireSuccess">Success</button>
          <button type="button" @click="fireError">Error</button>
          <button type="button" @click="fireInfo">Info</button>
          <button type="button" @click="fireWarning">Warning</button>
        </div>
      </section>

      <section>
        <h2>Show and update</h2>
        <div class="grid">
          <button type="button" @click="fireShowString">show(string)</button>
          <button type="button" @click="fireUpdateFlow">show + update</button>
          <button type="button" @click="fireButtonsToast">Toast buttons</button>
        </div>
      </section>

      <section>
        <h2>Async loading</h2>
        <div class="grid">
          <button type="button" @click="fireLoadingSuccess">
            loading() success
          </button>
          <button type="button" @click="fireLoadingError">
            loading() error
          </button>
        </div>
      </section>

      <section>
        <h2>Behavior</h2>
        <div class="grid">
          <button type="button" @click="fireQueueBurst">Queue burst</button>
          <button type="button" @click="fireDuplicateBurst">
            Prevent duplicates
          </button>
          <button
            type="button"
            :disabled="!lastToastId"
            @click="dismissLastToast"
          >
            Dismiss last
          </button>
          <button type="button" @click="dismissAllToasts">Dismiss all</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const lastToastId = ref<string | null>(null);

function remember(id: string): void {
  lastToastId.value = id;
}

function fireDefault(): void {
  remember(
    toast.default({
      title: "Default toast",
      description: "Smoke test default variant.",
    }),
  );
}

function fireSuccess(): void {
  remember(
    toast.success({
      title: "Module ready",
      description: "nuxt-toastflow wrapper is working.",
    }),
  );
}

function fireError(): void {
  remember(
    toast.error({
      title: "Test error",
      description: "This is a manual test toast.",
    }),
  );
}

function fireInfo(): void {
  remember(
    toast.info({
      title: "Info test",
      description: "Informational toast render check.",
    }),
  );
}

function fireWarning(): void {
  remember(
    toast.warning({
      title: "Warning test",
      description: "Warning toast render check.",
    }),
  );
}

function fireShowString(): void {
  remember(
    toast.show("String title API", {
      description: "This was created via show(string, options).",
      type: "default",
    }),
  );
}

function fireUpdateFlow(): void {
  const id = toast.show({
    type: "info",
    title: "Updating soon",
    description: "This toast will update in 1.2s.",
    duration: 7000,
  });
  remember(id);

  setTimeout(function () {
    toast.update(id, {
      type: "success",
      title: "Updated",
      description: "toast.update(...) changed this message.",
    });
  }, 1200);
}

function fireButtonsToast(): void {
  remember(
    toast.info({
      title: "Buttons test",
      description: "Use actions to test callbacks.",
      duration: 9000,
      buttons: {
        buttons: [
          {
            label: "Acknowledge",
            onClick(ctx) {
              toast.dismiss(ctx.id);
            },
          },
          {
            label: "Another toast",
            onClick() {
              toast.success({
                title: "Action executed",
                description: "Button callback fired.",
              });
            },
          },
        ],
      },
    }),
  );
}

async function fireLoadingSuccess(): Promise<void> {
  const request = toast.loading(
    function () {
      return new Promise<string>(function (resolve) {
        setTimeout(function () {
          resolve("ok");
        }, 1400);
      });
    },
    {
      loading: {
        title: "Loading success path",
        description: "Waiting for async result...",
      },
      success(value) {
        return {
          title: "Loaded",
          description: `Result: ${value}`,
        };
      },
      error(error) {
        return {
          title: "Unexpected error",
          description:
            error instanceof Error ? error.message : "Unknown loading error",
        };
      },
    },
  );

  remember(request.toastId);
  await request;
}

async function fireLoadingError(): Promise<void> {
  const request = toast.loading(
    function () {
      return new Promise<string>(function (_resolve, reject) {
        setTimeout(function () {
          reject(new Error("Simulated request failure"));
        }, 1400);
      });
    },
    {
      loading: {
        title: "Loading error path",
        description: "This request will fail.",
      },
      success() {
        return {
          title: "Unexpected success",
          description: "This branch should not happen.",
        };
      },
      error(error) {
        return {
          title: "Failed as expected",
          description:
            error instanceof Error ? error.message : "Unknown loading error",
        };
      },
    },
  );

  remember(request.toastId);
  try {
    await request;
  } catch {
    // expected in this scenario
  }
}

function fireQueueBurst(): void {
  for (let index = 1; index <= 8; index += 1) {
    const id = toast.show({
      type: "default",
      title: `Queued #${index}`,
      description: "queue + maxVisible behavior test.",
      queue: true,
      maxVisible: 2,
      duration: 3500,
    });
    remember(id);
  }
}

function fireDuplicateBurst(): void {
  for (let index = 0; index < 3; index += 1) {
    const id = toast.success({
      title: "Duplicate test",
      description: "Only one should remain with preventDuplicates.",
      preventDuplicates: true,
      duration: 6000,
    });
    remember(id);
  }
}

function dismissLastToast(): void {
  if (!lastToastId.value) {
    return;
  }
  toast.dismiss(lastToastId.value);
}

function dismissAllToasts(): void {
  toast.dismissAll();
}
</script>

<style scoped>
.app {
  min-height: 100dvh;
  width: 100%;
  box-sizing: border-box;
  padding: 24px;
  display: grid;
  place-items: center;
  background: #f3f4f6;
}

.panel {
  width: min(760px, 100%);
  display: grid;
  gap: 18px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 20px;
}

section {
  display: grid;
  gap: 10px;
}

h1,
h2 {
  margin: 0;
}

h2 {
  font-size: 16px;
  color: #374151;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

button {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>

<style>
html,
body {
  margin: 0;
  min-height: 100%;
}
</style>
