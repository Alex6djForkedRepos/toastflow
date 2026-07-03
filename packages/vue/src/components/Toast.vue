<script setup lang="ts">
import { inject, toRefs } from "vue";
import ToastButtonsGroup from "./ToastButtonsGroup.vue";
import ToastProgress from "./ToastProgress.vue";
import XMark from "./icons/XMark.vue";
import type {
  ToastId,
  ToastInstance,
  ToastStandaloneInstance,
  ToastStore,
} from "toastflow-core";
import { toastStoreKey } from "../symbols";
import { getToastStore } from "../toast";
import { useToastUI } from "../toast-ui";

const props = defineProps<{
  toast: ToastStandaloneInstance | ToastInstance;
  progressResetKey?: number;
  duplicateKey?: number;
  updateKey?: number;
  bumpAnimationClass?: string;
  clearAllAnimationClass?: string;
  updateAnimationClass?: string;
}>();

const {
  toast: toastProp,
  progressResetKey,
  duplicateKey,
  updateKey,
  bumpAnimationClass,
  clearAllAnimationClass,
  updateAnimationClass,
} = toRefs(props);

const emit = defineEmits<{
  (e: "dismiss", id: ToastId): void;
}>();

const injectedStore = inject<ToastStore | null>(toastStoreKey, null);
const store: ToastStore = injectedStore ?? getToastStore();

function dismiss(id: ToastId) {
  emit("dismiss", id);
}

const {
  toast,
  createdAtText,
  createdAtAriaLabel,
  titleAriaLabel,
  descriptionAriaLabel,
  sanitizedTitle,
  sanitizedDescription,
  buttons,
  buttonsClasses,
  handleButtonClick,
  showMetaTop,
  showMetaLeft,
  showMetaRight,
  showMetaBottom,
  hasOutsideButtons,
  showInlineCreatedAt,
  showFloatingCreatedAt,
  ui,
} = useToastUI({
  toast: toastProp,
  store,
  progressResetKey,
  duplicateKey,
  updateKey,
  onDismiss: dismiss,
  bumpAnimationClass,
  clearAllAnimationClass,
  updateAnimationClass,
});
</script>

<template>
  <div v-bind="ui.wrapperProps">
    <div v-bind="ui.rootProps">
      <div class="tf-toast-surface">
        <div
          v-if="showMetaTop"
          class="tf-toast-meta-row tf-toast-meta-row--top"
        >
          <ToastButtonsGroup
            :buttons="buttons"
            :classes="buttonsClasses"
            :on-button-click="handleButtonClick"
          />
        </div>

        <div
          class="tf-toast-main"
          :class="[
            hasOutsideButtons && 'tf-toast-main--full',
            showMetaLeft && 'tf-toast-main--content-end',
          ]"
        >
          <div v-if="showMetaLeft" class="tf-toast-meta tf-toast-meta--left">
            <ToastButtonsGroup
              :buttons="buttons"
              :classes="buttonsClasses"
              :on-button-click="handleButtonClick"
            />
          </div>

          <div class="tf-toast-main-content">
            <div v-if="ui.icon.show" v-bind="ui.icon.wrapperProps">
              <slot name="icon" :toast="toast">
                <component
                  :is="ui.icon.component"
                  v-bind="ui.icon.componentProps"
                />
              </slot>
            </div>

            <div
              class="tf-toast-body"
              :class="[showInlineCreatedAt && 'tf-toast-body--has-created-at']"
            >
              <div class="tf-toast-text">
                <p
                  v-if="toast.title && !toast.supportHtml"
                  :aria-label="titleAriaLabel || undefined"
                  class="tf-toast-title"
                >
                  {{ toast.title }}
                </p>
                <p
                  v-else-if="toast.title && toast.supportHtml"
                  class="tf-toast-title"
                  :aria-label="titleAriaLabel || undefined"
                  v-html="sanitizedTitle"
                ></p>

                <p
                  v-if="toast.description && !toast.supportHtml"
                  :aria-label="descriptionAriaLabel || undefined"
                  class="tf-toast-description"
                >
                  {{ toast.description }}
                </p>
                <p
                  v-else-if="toast.description && toast.supportHtml"
                  class="tf-toast-description"
                  :aria-label="descriptionAriaLabel || undefined"
                  v-html="sanitizedDescription"
                ></p>
              </div>

              <slot :toast="toast" />

              <div v-if="showInlineCreatedAt" class="tf-toast-created-at">
                <slot
                  name="created-at"
                  :toast="toast"
                  :formatted="createdAtText"
                >
                  <span :aria-label="createdAtAriaLabel || undefined">
                    {{ createdAtText }}
                  </span>
                </slot>
              </div>
            </div>
          </div>

          <div v-if="showMetaRight" class="tf-toast-meta tf-toast-meta--right">
            <ToastButtonsGroup
              :buttons="buttons"
              :classes="buttonsClasses"
              :on-button-click="handleButtonClick"
            />
          </div>
        </div>

        <div
          v-if="showMetaBottom"
          class="tf-toast-meta-row tf-toast-meta-row--bottom"
        >
          <ToastButtonsGroup
            :buttons="buttons"
            :classes="buttonsClasses"
            :on-button-click="handleButtonClick"
          />
        </div>

        <div v-if="ui.progress.show" v-bind="ui.progress.wrapperProps">
          <slot name="progress" :toast="toast">
            <ToastProgress
              :key="ui.progress.key"
              :track-props="ui.progress.trackProps"
              :bar-props="ui.progress.barProps"
            />
          </slot>
        </div>
      </div>

      <div
        v-if="showFloatingCreatedAt || toast.closeButton"
        class="tf-toast-floating-bar"
      >
        <div v-if="showFloatingCreatedAt" class="tf-toast-created-at-float">
          <slot name="created-at" :toast="toast" :formatted="createdAtText">
            <span :aria-label="createdAtAriaLabel || undefined">
              {{ createdAtText }}
            </span>
          </slot>
        </div>

        <button v-if="toast.closeButton" v-bind="ui.closeProps">
          <slot name="close-icon" :toast="toast">
            <XMark class="tf-toast-close-icon" aria-hidden="true" />
          </slot>
        </button>
      </div>
    </div>
  </div>
</template>
