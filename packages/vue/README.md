<p align="center">
  <img src="../../assets/banner.png" alt="Toastflow" width="100%" />
</p>

<h1 align="center">🟢 vue-toastflow</h1>

<p align="center">
  <strong>Vue 3 renderer for Toastflow</strong> — components, programmatic API, and beautiful defaults.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vue-toastflow"><img src="https://img.shields.io/npm/v/vue-toastflow?color=43b883&style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/vue-toastflow"><img src="https://img.shields.io/npm/dm/vue-toastflow?style=flat-square" alt="npm downloads" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/github/license/adrianjanocko/toastflow?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="https://www.toastflow.top/docs">📖 Docs</a> · <a href="https://www.toastflow.top/">🎮 Playground</a> · <a href="https://www.toastflow.top/docs/more/comparisons">⚔️ Comparisons</a>
</p>

---

> 💚 Using **Nuxt**? Install [`nuxt-toastflow`](https://www.npmjs.com/package/nuxt-toastflow) instead — it wraps this package with auto-imports and SSR support.

> `createToastflow()` injects Toastflow's default CSS by default. Pass `createToastflow(config, { css: false })` to disable that and import `vue-toastflow/styles.css` manually only when you want the shipped styles.

## 📦 What's Included

|     | Feature                                                  |
| :-: | :------------------------------------------------------- |
| 🔌  | `createToastflow` plugin                                 |
| 🎯  | `toast` programmatic API                                 |
| 🧱  | `<ToastContainer />` · `<Toast />` · `<ToastProgress />` |
| 🎨  | Default styles and icon components                       |

## 🚀 Quick Start

**1. Install**

```bash
pnpm add vue-toastflow
```

**2. Register the plugin**

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App).use(createToastflow()).mount("#app");
```

**3. Use it ✨**

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ToastContainer, toast } from "vue-toastflow";

toast.success({ title: "Saved", description: "Your changes are live." });
</script>

<template>
  <ToastContainer />
</template>
```

> 💡 See the full [Vue Quick Start](https://www.toastflow.top/docs/vue/quick-start) guide for theming, slots, events, and more.

## 📄 License

[MIT](../../LICENSE) — made with ❤️ by [@adrianjanocko](https://github.com/adrianjanocko)
