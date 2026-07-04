<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onErrorCaptured,
  onMounted,
  ref,
  shallowRef,
  type Component,
} from "vue";
import LoadingPanel from "@/components/LoadingPanel.vue";

type ReplFiles = Record<string, string>;

declare const __TOASTFLOW_CORE_VERSION__: string | undefined;
declare const __VUE_TOASTFLOW_VERSION__: string | undefined;
declare const __TOASTFLOW_LOCAL_DEV__: boolean | undefined;

const TOASTFLOW_CORE_VERSION = __TOASTFLOW_CORE_VERSION__ || "latest";
const VUE_TOASTFLOW_VERSION = __VUE_TOASTFLOW_VERSION__ || "latest";
const IS_LOCAL_DEV = Boolean(__TOASTFLOW_LOCAL_DEV__);

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    files: ReplFiles;
    mainFile?: string;
    height?: number;
    layout?: "horizontal" | "vertical";
    showImportMap?: boolean;
  }>(),
  {
    mainFile: "App.vue",
    height: 760,
    layout: "vertical",
    showImportMap: false,
  },
);

const ready = ref(false);
const errorMessage = ref("");
const runtimeError = ref("");
const replComponent = shallowRef<Component | null>(null);
const editorComponent = shallowRef<Component | null>(null);
const store = shallowRef<unknown>(null);

const statusLabel = computed(function () {
  if (runtimeError.value) {
    return "runtime-error";
  }
  if (errorMessage.value) {
    return "init-error";
  }
  if (ready.value) {
    return "ready";
  }
  return "loading";
});

const replHeight = computed(function () {
  return props.height ?? 760;
});

const replMobileHeight = computed(function () {
  return Math.min(Math.max(Math.round(replHeight.value * 0.58), 460), 620);
});

onErrorCaptured(function (error) {
  runtimeError.value =
    error instanceof Error
      ? `Vue REPL runtime error: ${error.message}`
      : "Vue REPL runtime error.";

  console.error("[toastflow-site] Vue REPL runtime error", error);
  return false;
});

const CDN_CSS_PATTERN =
  /https:\/\/cdn\.jsdelivr\.net\/npm\/vue-toastflow@[^"'\s)]+\/dist\/vue-toastflow\.css/g;

function patchFilesForLocalDev(files: ReplFiles): ReplFiles {
  if (typeof window === "undefined") {
    return files;
  }

  const localCssUrl = `${window.location.origin}/@toastflow-local/vue/vue-toastflow.css`;

  return Object.fromEntries(
    Object.entries(files).map(([name, content]) => [
      name,
      content.replace(CDN_CSS_PATTERN, localCssUrl),
    ]),
  );
}

const shellEl = ref<HTMLElement | null>(null);
let visibilityObserver: IntersectionObserver | null = null;

// The REPL bundle (editor + compiler) is heavy — defer loading it until the
// shell is near the viewport.
onMounted(function () {
  const el = shellEl.value;

  if (typeof IntersectionObserver === "undefined" || !el) {
    void initRepl();
    return;
  }

  visibilityObserver = new IntersectionObserver(
    function (entries) {
      if (entries.some((entry) => entry.isIntersecting)) {
        visibilityObserver?.disconnect();
        visibilityObserver = null;
        void initRepl();
      }
    },
    { rootMargin: "200px" },
  );
  visibilityObserver.observe(el);
});

onBeforeUnmount(function () {
  visibilityObserver?.disconnect();
  visibilityObserver = null;
});

async function initRepl() {
  if (ready.value) {
    return;
  }

  try {
    const [replModule, codeMirrorModule] = await Promise.all([
      import("@vue/repl"),
      import("@vue/repl/codemirror-editor"),
      import("@vue/repl/style.css"),
    ]);

    const { useStore, useVueImportMap, Repl } = replModule;
    const { importMap: builtinImportMap, vueVersion } = useVueImportMap();

    const localStore = useStore({
      builtinImportMap,
      vueVersion,
      showOutput: ref(true),
      outputMode: ref("preview"),
    });

    await localStore.setFiles(
      IS_LOCAL_DEV ? patchFilesForLocalDev(props.files) : props.files,
      props.mainFile,
    );

    localStore.setImportMap(
      {
        imports: IS_LOCAL_DEV
          ? {
              "toastflow-core": `${window.location.origin}/@toastflow-local/core/index.mjs`,
              "vue-toastflow": `${window.location.origin}/@toastflow-local/vue/toastflow.es.js`,
            }
          : {
              "toastflow-core": `https://cdn.jsdelivr.net/npm/toastflow-core@${TOASTFLOW_CORE_VERSION}/dist/index.mjs`,
              "vue-toastflow": `https://cdn.jsdelivr.net/npm/vue-toastflow@${VUE_TOASTFLOW_VERSION}/dist/toastflow.es.js`,
            },
      },
      true,
    );

    localStore.showOutput = true;
    localStore.outputMode = "preview";

    replComponent.value = Repl;
    editorComponent.value = codeMirrorModule.default;
    store.value = localStore;
    ready.value = true;
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? `Failed to initialize Vue REPL: ${error.message}`
        : "Failed to initialize Vue REPL.";
    console.error("[toastflow-site] Vue REPL init error", error);
  }
}
</script>

<template>
  <div ref="shellEl" class="tf-repl-shell">
    <div v-if="title || description" class="tf-repl-header">
      <p v-if="title" class="tf-repl-title">{{ title }}</p>
      <p v-if="description" class="tf-repl-description">{{ description }}</p>
    </div>

    <ClientOnly>
      <div
        class="tf-repl-body"
        :data-repl-state="statusLabel"
        :style="{
          '--tf-repl-height': `${replHeight}px`,
          '--tf-repl-height-mobile': `${replMobileHeight}px`,
        }"
      >
        <component
          :is="replComponent"
          v-if="
            ready && replComponent && editorComponent && store && !runtimeError
          "
          :editor="editorComponent"
          :store="store"
          theme="dark"
          :preview-theme="true"
          :layout="layout"
          :layout-reverse="false"
          :show-import-map="showImportMap"
          :show-ts-config="false"
          :show-ssr-output="false"
          :show-open-source-map="false"
          :show-compile-output="false"
          :clear-console="true"
          :auto-resize="true"
          :split-pane-options="{
            codeTogglerText: 'Code',
            outputTogglerText: 'Preview',
          }"
        />

        <div v-else-if="runtimeError || errorMessage" class="tf-repl-fallback">
          {{ runtimeError || errorMessage }}
        </div>

        <LoadingPanel v-else label="Loading Vue REPL…" plain class="h-full" />
      </div>

      <template #fallback>
        <LoadingPanel label="Loading Vue REPL…" min-height="200px" plain />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.tf-repl-shell {
  margin: 1rem 0 1.625rem;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: 0.875rem;
  background: var(--ui-bg-elevated);
}

.tf-repl-header {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ui-border);
}

.tf-repl-title {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: 0.98rem;
  font-weight: 700;
}

.tf-repl-description {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.88rem;
}

.tf-repl-body {
  height: var(--tf-repl-height, 760px);
}

.tf-repl-body :deep(.vue-repl) {
  height: 100%;
}

.tf-repl-fallback {
  padding: 1.375rem;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .tf-repl-body {
    height: var(--tf-repl-height-mobile, 620px);
  }
}
</style>
