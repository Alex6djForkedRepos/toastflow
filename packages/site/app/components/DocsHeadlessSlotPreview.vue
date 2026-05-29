<script setup lang="ts">
import { provide } from "vue";
import {
  createToastStore,
  ToastContainer,
  type ToastStore,
} from "vue-toastflow";
import type { InjectionKey } from "vue";

const previewStore = createToastStore({
  duration: 6500,
  position: "top-right",
  progressBar: true,
  width: "390px",
});

const toastStoreKey = Symbol.for(
  "vue-toastflow.toast-store",
) as InjectionKey<ToastStore>;

provide(toastStoreKey, previewStore);

function showHeadlessToast() {
  previewStore.show({
    type: "success",
    title: "Deploy approved",
    description: "This card is fully rendered by your slot template.",
    buttons: {
      alignment: "bottom-right",
      buttons: [
        {
          id: "details",
          label: "View details",
          dismissAfterClick: true,
        },
      ],
    },
  });
}
</script>

<template>
  <UCard>
    <div class="flex flex-col gap-3">
      <div>
        <p class="text-sm font-medium text-highlighted">Try this slot</p>
        <p class="mt-1 text-sm text-muted">
          Button renders a custom card through the same
          <code>ToastContainer</code> slot helpers shown above.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton icon="i-tabler-template" @click="showHeadlessToast">
          Show headless toast
        </UButton>
      </div>
    </div>
  </UCard>

  <ToastContainer v-slot="{ toast, ui }">
    <div v-bind="ui.getWrapperProps()">
      <article v-bind="ui.getRootProps({ class: 'docs-headless-toast' })">
        <div class="docs-headless-toast__rail" aria-hidden="true">
          <span></span>
        </div>

        <div class="docs-headless-toast__panel">
          <div class="docs-headless-toast__topline">
            <span class="docs-headless-toast__eyebrow">
              Headless renderer
            </span>

            <button
              v-bind="
                ui.getCloseProps({
                  class: 'docs-headless-toast__close',
                  'aria-label': 'Close toast',
                })
              "
            >
              <UIcon name="i-tabler-x" aria-hidden="true" />
            </button>
          </div>

          <div class="docs-headless-toast__body">
            <div class="docs-headless-toast__mark" aria-hidden="true">
              <UIcon name="i-tabler-bolt" />
            </div>

            <div class="docs-headless-toast__content">
              <strong>{{ toast.title }}</strong>
              <p v-if="toast.description">{{ toast.description }}</p>
            </div>
          </div>

          <div
            v-if="ui.buttons.has"
            v-bind="
              ui.buttons.getGroupProps({
                class: 'docs-headless-toast__actions',
              })
            "
          >
            <button
              v-for="button in ui.buttons.items"
              :key="button.id"
              v-bind="
                ui.getButtonProps(button, {
                  class: 'docs-headless-toast__button',
                })
              "
            >
              {{ button.label }}
            </button>
          </div>

          <div
            v-if="ui.progress.show"
            v-bind="
              ui.progress.getTrackProps({
                class: 'docs-headless-toast__progress',
              })
            "
          >
            <div
              v-bind="
                ui.progress.getBarProps({
                  class: 'docs-headless-toast__bar',
                })
              "
            />
          </div>
        </div>
      </article>
    </div>
  </ToastContainer>
</template>

<style>
.docs-headless-toast {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  border: 1px solid #a7f3d0;
  border-radius: 26px 8px 26px 8px;
  background:
    radial-gradient(circle at top left, rgb(251 191 36 / 18%), transparent 38%),
    linear-gradient(135deg, #ffffff 0%, #ecfeff 100%);
  color: #0f172a;
  box-shadow:
    0 18px 44px rgb(15 23 42 / 14%),
    0 0 0 5px rgb(20 184 166 / 10%);
  overflow: hidden;
}

.docs-headless-toast__rail {
  position: relative;
  display: grid;
  place-items: center;
  background: #14b8a6;
}

.docs-headless-toast__rail::before {
  position: absolute;
  inset: 12px 50% 12px auto;
  width: 1px;
  border-left: 1px dashed rgb(255 255 255 / 60%);
  content: "";
}

.docs-headless-toast__rail span {
  position: relative;
  width: 18px;
  height: 18px;
  border: 3px solid #ffffff;
  border-radius: 999px;
  background: #f59e0b;
  box-shadow: 0 0 0 5px rgb(255 255 255 / 20%);
}

.docs-headless-toast__panel {
  min-width: 0;
  padding: 14px 14px 12px;
}

.docs-headless-toast__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.docs-headless-toast__eyebrow {
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  padding: 5px 8px;
  text-transform: uppercase;
}

.docs-headless-toast__close {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 1px solid #ccfbf1;
  border-radius: 999px;
  background: #ffffff;
  color: #0f766e;
  cursor: pointer;
}

.docs-headless-toast__body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.docs-headless-toast__mark {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  background: #0f766e;
  color: #ffffff;
  font-size: 20px;
  transform: rotate(-4deg);
}

.docs-headless-toast__content {
  min-width: 0;
  flex: 1 1 auto;
}

.docs-headless-toast__content strong {
  display: block;
  color: #0f172a;
  font-size: 15px;
  line-height: 1.25;
}

.docs-headless-toast__content p {
  margin: 4px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.35;
}

.docs-headless-toast__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.docs-headless-toast__button {
  border: 0;
  border-radius: 999px;
  background: #0f766e;
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 12px;
}

.docs-headless-toast__progress {
  height: 5px;
  margin-top: 12px;
  border-radius: 999px;
  background: #ccfbf1;
  overflow: hidden;
}

.docs-headless-toast__bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f59e0b, #14b8a6);
}
</style>
