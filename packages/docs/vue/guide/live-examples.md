---
title: Live Examples
outline: deep
---

<script setup lang="ts">
import {
  coreFiles,
  eventsFiles,
  headlessFiles,
  helperFiles,
  loadingFiles,
  queueFiles,
  randomFeedFiles,
  themeFiles,
} from "./repl-examples";
</script>

# Live Examples

## ⚡ Helpers and Update

<ToastflowRepl
  :files="helperFiles"
  main-file="main.ts"
  layout="vertical"
  title="show() overloads + typed helpers"
  description="Use object, string + options, text + options, then patch the last toast by id."
  :height="1020"
/>

## ⏳ Loading Workflow

<ToastflowRepl
  :files="loadingFiles"
  main-file="main.ts"
  layout="vertical"
  title="Promise lifecycle with toast.loading"
  description="Single toast id transitions through loading, success, and error states."
  :height="1020"
/>

## 🎨 Theming and HTML

<ToastflowRepl
  :files="themeFiles"
  main-file="main.ts"
  layout="vertical"
  title="Custom theme, HTML content, and action buttons"
  description="Use supportHtml, created-at badges, and per-toast accent classes."
  :height="1020"
/>

## 🧩 Headless Rendering

<ToastflowRepl
  :files="headlessFiles"
  main-file="main.ts"
  layout="vertical"
  title="Render custom cards via ToastContainer slot"
  description="Keep Toastflow runtime logic while replacing the default toast markup."
  :height="1060"
/>

## 📡 State and Events

<ToastflowRepl
  :files="eventsFiles"
  main-file="main.ts"
  layout="vertical"
  title="subscribe() and subscribeEvents()"
  description="Observe live state snapshots and emitted events in Vue integration."
  :height="1020"
/>

## 🎲 Random Feed with `<Toast />`

<ToastflowRepl
  :files="randomFeedFiles"
  main-file="main.ts"
  layout="vertical"
  title="send toast -> save -> render via Toast component"
  description="Each click sends a random runtime toast and stores a copy rendered below buttons."
  :height="1080"
/>

## 📥 Queue and Backpressure

<ToastflowRepl
  :files="queueFiles"
  main-file="main.ts"
  layout="vertical"
  title="queue: true + maxVisible + queue controls"
  description="Push batches, inspect visible/queued counts, and control queue processing."
  :height="1080"
/>

## ⚙️ Core Store Only

<ToastflowRepl
  :files="coreFiles"
  main-file="main.ts"
  layout="vertical"
  title="createToastStore without Vue plugin"
  description="Direct core API usage: show, update, pause, resume, and dismiss."
  :height="960"
/>
