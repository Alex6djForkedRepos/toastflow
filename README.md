# Toastflow

Lightweight, opinionated toasts that feel good out of the box. Built as a small TypeScript core with a Vue 3 renderer.

## Why you’ll like it

- ⚡️ Drop-in Vue plugin with typed helpers (`toast.success`, `toast.loading`, …)
- 🛡️ Duplicate protection with bump + timer reset (including loading flows)
- ⏳ Promise-friendly loading that auto-swaps to success/error per run
- 🎛️ Per-stack limits, ordering, pause-on-hover, close-on-click, HTML opt-in
- 🎨 Theming via CSS vars and overridable animation class names

## Install

```bash
npm install vue-toastflow
# or pnpm add vue-toastflow
```

## Quick start (Vue 3)

```ts
// main.ts
import {createApp} from "vue";
import App from "./App.vue";
import {createToastflow, ToastContainer} from "vue-toastflow";

const app = createApp(App);
app.use(createToastflow());          // pass ToastConfig here if you want
app.component("ToastContainer", ToastContainer);
app.mount("#app");
```

Render the container once:

```vue

<template>
  <AppLayout/>
  <ToastContainer/>
</template>
```

Fire toasts (title or description required):

```ts
import {toast} from "vue-toastflow";

toast.success({title: "Saved", description: "Your changes are live."});
toast.warning({description: "Low balance"});          // no title is ok

const id = toast.error({title: "Oops", description: "Check console."});
toast.update(id, {description: "Fixed. All good now."});
```

Async flows with loading → success/error:

```ts
const task = toast.loading(
    () => fetch("/api/save").then((r) => r.json()),
    {
        loading: {title: "Saving", description: "Hang tight."},
        success: {title: "Saved", description: "We stored your changes."},
        error: {title: "Error", description: "Please try again."},
    },
);
console.log("toast id:", task.toastId);
```

## Configuration (essentials)

Pass a partial `ToastConfig` to `createToastflow` or per toast:

- `position`: `"top-right"` (default), `"top-left"`, `"top-center"`, `"bottom-*"`
- `duration`: ms before auto-dismiss (`Infinity` to disable)
- `maxVisible`: per-stack cap (0 = unlimited), `order`: `"newest"` | `"oldest"`
- `preventDuplicates`: merge identical toasts, bump + reset timer
- `progressBar`, `pauseOnHover`, `pauseStrategy`, `closeButton`, `closeOnClick`
- `animation`: class names for enter/leave/bump/update/clearAll
- `supportHtml`: allow HTML in title/description (opt-in)

Full type source: `packages/core/src/types.ts`.

## API highlights

- `toast.show(options)` low-level entry.
- Shorthands: `toast.toast`, `toast.success`, `toast.error`, `toast.warning`, `toast.info`.
- `toast.loading(input, config)` returns a Promise with `toastId`.
- `toast.update(id, options)`, `toast.dismiss(id)`, `toast.dismissAll()`.
- Events: `toast.subscribeEvents` gets `duplicate`, `timer-reset`, `update`.

## Styling

- Default stylesheet lives at `packages/vue/src/styles.css` (bundled by the package). Override CSS variables or swap
  animation class names via `animation` in config.

## Playground

- Vue playground: `packages/playground/vue` for hands-on tweaking of options.

## License

MIT
