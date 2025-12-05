# Toastflow

Framework-agnostic toast engine with a Vue 3 renderer. Typed core, smooth stack animations, CSS-first theming, and full
control over layout and behavior.

## What's inside

- [toastflow-core](packages/core): tiny, framework-agnostic store with a typed API.
- [vue-toastflow](packages/vue): Vue 3 layer with `<ToastContainer />`, a global `toast` helper, defaults, and icons.

## Why it exists

- Testable, framework-agnostic store that can power Vue today (and other renderers later).
- Layout + animation are yours: no black-box component you cannot restyle.
- Works both in components and in plain TS/JS modules (services, API clients, etc.).
- Predictable rules for duplicates, timers, pause-on-hover, close-on-click, clear-all.
- CSS-driven: swap the look by editing a handful of vars.

## Install

```bash
pnpm add vue-toastflow
# or: npm install vue-toastflow
```

## Quick start (Vue 3 + TS)

1) Register the plugin once (all config keys, typescript, etc. live in [types.ts](packages/core/src/types.ts)):

```ts
// main.ts
import {createApp} from "vue";
import App from "./App.vue";
import {createToastflow, ToastContainer} from "vue-toastflow";

const app = createApp(App);

app.use(
    createToastflow({
        // optional global defaults
        position: "top-right",
        duration: 5000,
    }),
);

// register globally or import locally where you render it
app.component("ToastContainer", ToastContainer);

// call toast.* only after the plugin is installed (also in services/modules)
app.mount("#app");
```

2) Drop a single container in your root layout:

```vue
<!-- App.vue -->
<template>
  <ToastContainer/>
  <RouterView/>
</template>
```

3) Fire toasts anywhere (all accessible methods available in [toast.ts](packages/vue/src/toast.ts)):

```ts
import {toast} from "vue-toastflow";

toast.success({title: "Saved", description: "Your changes are live."});
toast.warning({description: "Low balance"}); // description-only is fine

const id = toast.error({title: "Oops", description: "Check console."});
toast.update(id, {description: "Fixed. All good now."});
toast.dismiss(id);
```

4) Async flows with `toast.loading`:

```ts
const run = toast.loading(
    () => fetch("/api/save").then((r) => r.json()),
    {
        loading: {title: "Saving", description: "Hang tight."},
        success: (data) => ({
            title: "Saved",
            description: `Stored item ${data.id}.`,
        }),
        error: (err) => ({
            title: "Error",
            description: err instanceof Error ? err.message : "Please try again.",
        }),
    },
);

await run; // Promise result of your task
console.log(run.toastId); // toast id you can dismiss/update later
```

5) HTML content (opt-in):

```ts
toast.info({
    title: "<strong>New version</strong>",
    description: "Release notes are <a href='/changelog'>here</a>.",
    supportHtml: true,
});
```

6) Show sent time:

```ts
toast.success({
    title: "Saved",
    showCreatedAt: true,
    createdAtFormatter: (ts) => new Date(ts).toLocaleString("sk-SK"),
});
```

## Headless / custom card

Use the container slot to render your own card while keeping store logic:

```vue

<ToastContainer
    v-slot="{
    toast,
    dismiss,
    bumpAnimationClass,
    clearAllAnimationClass,
    updateAnimationClass
  }"
>
  <div
      class="my-toast"
      :class="[
      toast.type,
      bumpAnimationClass,
      toast.phase === 'clear-all' && clearAllAnimationClass,
      updateAnimationClass
    ]"
      @click="toast.closeOnClick && dismiss(toast.id)"
  >
    <header>
      <strong>{{ toast.title }}</strong>
      <button @click.stop="dismiss(toast.id)">x</button>
    </header>
    <p v-if="toast.description">{{ toast.description }}</p>
    <small v-if="toast.showCreatedAt">
      Sent at {{ toast.createdAtFormatter(toast.createdAt) }}
    </small>
  </div>
</ToastContainer>
```

You still control everything via `toast.show`/`toast.success`/`toast.loading`; only the rendering changes.

## Configuration

Pass any [types.ts](packages/core/src/types.ts) fields to `createToastflow`; per-toast options override them:

- `position`: "top-right" (default), "top-left", "top-center", "bottom-*"
- `duration`: `5000` ms by default; `Infinity` or `0` disables auto-dismiss (progress bar auto-hides when disabled)
- `maxVisible`: `5` per stack; eviction respects `order`
- `order`: "newest" (default) or "oldest" per stack
- `preventDuplicates`: `false` by default; matches by position + type + title + description
- `progressBar`, `pauseOnHover`, `pauseStrategy` ("resume" | "reset")
- `animation`: class names for enter/leave/move (`name`), bump, clearAll, update (defaults use `Toastflow__*`)
- `closeButton` (`true`), `closeOnClick` (`false`)
- `offset` (`16px`), `gap` (`8px`), `width` (`350px`), `zIndex` (`9999`)
- `supportHtml`: `false` (opt-in)
- `showCreatedAt` and `createdAtFormatter` for timestamps
- lifecycle hooks: `onMount`, `onUnmount`, `onClick`, `onClose`

## Slots and theming

- CSS variables live in `packages/vue/src/styles.css` and are auto-imported. Key
  ones: `--tf-toast-bg`, `--tf-toast-color`, `--tf-toast-border-color`, `--tf-toast-radius`, `--tf-toast-padding`, `--tf-toast-icon-size`, `--tf-toast-progress-height`,
  per-type colors like `--success-bg`, `--error-text`, etc.
- `<Toast>` slots: `icon`, `progress`, `close-icon`, `created-at`, plus the default slot for extra content inside the
  body.
- `<ToastContainer>` default slot
  receives `{ toast, dismiss, progressResetKey, duplicateKey, updateKey, bumpAnimationClass, clearAllAnimationClass, updateAnimationClass }`.
- Animations are pure CSS class names; swap them via `animation` config or override the `Toastflow__*` keyframes.

## Events and store access

- `toast.subscribeEvents(listener)` gets `duplicate`, `timer-reset`, `update` events.
- `toast.getState()` returns the current snapshot; all helper
  methods (`toast.show`, `toast.success`, `toast.error`, `toast.warning`, `toast.info`, `toast.loading`, `toast.update`, `toast.dismiss`, `toast.dismissAll`, `toast.pause`, `toast.resume`, `toast.getConfig`)
  are available after installing the plugin.

## TypeScript

All types live in [types.ts](packages/core/src/types.ts) and are re-exported
from `vue-toastflow` (`ToastConfig`, `ToastOptions`, `ToastInstance`, `ToastId`, `ToastPosition`, `ToastType`, `ToastEvent`, `ToastStore`,
etc.).

## License

MIT
