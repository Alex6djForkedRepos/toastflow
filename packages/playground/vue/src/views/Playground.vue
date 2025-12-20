<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  toast,
  type ToastAlignment,
  type ToastContext,
  type ToastProgressAlignment,
} from 'vue-toastflow';
import type {
  PauseStrategy,
  ToastButton,
  ToastButtonsAlignment,
  ToastContentInput,
  ToastId,
  ToastOptions,
  ToastOrder,
  ToastPosition,
  ToastType,
} from 'toastflow-core';
import ActionsFooter from '../components/ActionsFooter.vue';
import BehaviorCard from '../components/cards/BehaviorCard.vue';
import ContentCard from '../components/card/EventsCard.vue';
import PositionCard from '../components/cards/PositionCard.vue';
import TimingLayoutCard from '../components/cards/TimingLimitsCard.vue';
import type { PlaygroundButton } from '../types/playgroundTypes.ts';

const config = toast.getConfig();

/* ----- reactive state ----- */

const position = ref<ToastPosition>(config.position);
const alignment = ref<ToastAlignment>(config.alignment);
const progressAlignment = ref<ToastProgressAlignment>(config.progressAlignment);
const type = ref<ToastType>('success');

const offset = ref(config.offset);
const gap = ref(config.gap);
const zIndex = ref(config.zIndex);
const width = ref(config.width);
const overflowScroll = ref(config.overflowScroll);

const duration = ref(config.duration);
const maxVisible = ref(config.maxVisible);

const preventDuplicates = ref(config.preventDuplicates);
const order = ref<ToastOrder>(config.order);

const progressBar = ref(config.progressBar);
const pauseOnHover = ref(config.pauseOnHover);
const pauseStrategy = ref<PauseStrategy>(config.pauseStrategy);

const closeButton = ref(config.closeButton);
const closeOnClick = ref(config.closeOnClick);

const supportHtml = ref(config.supportHtml);

const showCreatedAt = ref(config.showCreatedAt);

const enableButtons = ref(false);
const buttonsAlignment = ref<ToastButtonsAlignment>('center-right');
const buttonsGap = ref('');
const buttonsContentGap = ref('');

let buttonCounter = 0;

function createPlaygroundButton(partial?: Partial<PlaygroundButton>): PlaygroundButton {
  buttonCounter += 1;
  return {
    id: `playground-button-${buttonCounter}`,
    mode: 'label',
    value: 'Action',
    className: '',
    ariaLabel: '',
    dismissOnClick: false,
    ...partial,
  };
}

const playgroundButtons = ref<PlaygroundButton[]>([
  createPlaygroundButton({ value: 'Undo', dismissOnClick: true }),
  createPlaygroundButton({
    mode: 'html',
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  }),
]);

const useOnMount = ref(false);
const useOnUnmount = ref(false);
const useOnClick = ref(false);
const useOnClose = ref(false);

const title = ref('');
const description = ref('');
const fallbackTitle = ref(true);
const fallbackDescription = ref(true);

const lastId = ref<ToastId | null>(null);

/* ----- helpers ----- */

function defaultTitleForType(t: ToastType): string {
  if (t === 'loading') {
    return 'Working on it';
  }
  if (t === 'success') {
    return 'Saved';
  }
  if (t === 'error') {
    return 'Something went wrong';
  }
  if (t === 'warning') {
    return 'Heads up';
  }
  return 'Information';
}

function defaultDescriptionForType(t: ToastType): string {
  if (t === 'loading') {
    return 'Hang tight while we finish this task.';
  }
  if (t === 'success') {
    return 'Your changes have been stored.';
  }
  if (t === 'error') {
    return 'Check the console for more details.';
  }
  if (t === 'warning') {
    return 'Please double-check your input.';
  }
  return 'This is just an informational toast.';
}

function resolveContent(value: string, fallback: string, allowFallback: boolean) {
  const trimmed = value.trim();
  if (trimmed) {
    return trimmed;
  }
  return allowFallback ? fallback : '';
}

function ensureContent(
  titleValue: string,
  descriptionValue: string,
  fallbackTitle: string,
  fallbackDescription: string,
) {
  const hasTitle = titleValue.trim().length > 0;
  const hasDescription = descriptionValue.trim().length > 0;

  if (hasTitle || hasDescription) {
    return { title: titleValue, description: descriptionValue };
  }

  console.warn(
    '[toastflow playground] At least one of title/description is required. Applying defaults.',
  );
  return { title: fallbackTitle, description: fallbackDescription };
}

/* ----- computed config for show() ----- */

const buttonsConfig = computed(function (): ToastOptions['buttons'] | undefined {
  if (!enableButtons.value) {
    return undefined;
  }

  const buttons = playgroundButtons.value
    .filter((button) => button.value.trim().length > 0)
    .map(function (button): ToastButton {
      const base = {
        id: button.id,
        className: button.className.trim() || undefined,
        ariaLabel: button.ariaLabel.trim() || undefined,
        onClick(ctx: ToastContext) {
          console.log('[vue-toastflow] button.onClick', ctx);
          if (button.dismissOnClick) {
            toast.dismiss(ctx.id);
          }
        },
      };

      if (button.mode === 'html') {
        return { ...base, html: button.value };
      }

      return { ...base, label: button.value };
    });

  if (!buttons.length) {
    return undefined;
  }

  return {
    alignment: buttonsAlignment.value,
    buttons,
    gap: buttonsGap.value.trim() || undefined,
    contentGap: buttonsContentGap.value.trim() || undefined,
  };
});

const baseConfig = computed<Partial<ToastOptions>>(function () {
  const reactiveConfig: Partial<ToastOptions> = {
    offset: offset.value,
    gap: gap.value,
    zIndex: zIndex.value,
    width: width.value,
    overflowScroll: overflowScroll.value,

    duration: duration.value,
    maxVisible: maxVisible.value,
    position: position.value,
    alignment: alignment.value,
    progressAlignment: progressAlignment.value,

    preventDuplicates: preventDuplicates.value,
    order: order.value,

    progressBar: progressBar.value,
    pauseOnHover: pauseOnHover.value,
    pauseStrategy: pauseStrategy.value,

    animation: {
      name: config.animation.name,
      bump: config.animation.bump,
      clearAll: config.animation.clearAll,
    },

    closeButton: closeButton.value,
    closeOnClick: closeOnClick.value,

    supportHtml: supportHtml.value,

    showCreatedAt: showCreatedAt.value,
  };

  if (buttonsConfig.value) {
    reactiveConfig.buttons = buttonsConfig.value;
  }

  if (useOnMount.value) {
    reactiveConfig.onMount = function (ctx: ToastContext) {
      console.log('[vue-toastflow] onMount', ctx);
    };
  }

  if (useOnUnmount.value) {
    reactiveConfig.onUnmount = function (ctx: ToastContext) {
      console.log('[vue-toastflow] onUnmount', ctx);
    };
  }

  if (useOnClick.value) {
    reactiveConfig.onClick = function (ctx: ToastContext, event: MouseEvent) {
      console.log('[vue-toastflow] onClick', ctx, event);
    };
  }

  if (useOnClose.value) {
    reactiveConfig.onClose = function (ctx: ToastContext) {
      console.log('[vue-toastflow] onClose', ctx);
    };
  }

  return reactiveConfig;
});

/* ----- actions ----- */

function pushLoading() {
  const loadingTitle = resolveContent(
    title.value,
    defaultTitleForType('loading'),
    fallbackTitle.value,
  );
  const loadingDescription = resolveContent(
    description.value,
    defaultDescriptionForType('loading'),
    fallbackDescription.value,
  );

  const loadingConfigBase = ensureContent(
    loadingTitle,
    loadingDescription,
    defaultTitleForType('loading'),
    defaultDescriptionForType('loading'),
  );

  const loadingConfig: ToastContentInput = {
    ...baseConfig.value,
    ...loadingConfigBase,
  };

  const successTitle = resolveContent(
    title.value,
    defaultTitleForType('success'),
    fallbackTitle.value,
  );
  const successDescription = resolveContent(
    description.value,
    defaultDescriptionForType('success'),
    fallbackDescription.value,
  );

  const errorTitle = resolveContent(title.value, defaultTitleForType('error'), fallbackTitle.value);
  const errorDescription = resolveContent(
    description.value,
    defaultDescriptionForType('error'),
    fallbackDescription.value,
  );

  const task = new Promise<string>(function (resolve, reject) {
    setTimeout(function () {
      if (Math.random() > 0.35) {
        resolve('done');
      } else {
        reject(new Error('Promise rejected'));
      }
    }, 1500);
  });

  const pending = toast.loading(task, {
    loading: loadingConfig,
    success() {
      const content = ensureContent(
        successTitle,
        successDescription,
        defaultTitleForType('success'),
        defaultDescriptionForType('success'),
      );
      return {
        ...baseConfig.value,
        ...content,
      };
    },
    error(error: unknown) {
      const message = error instanceof Error && error.message ? error.message : errorDescription;
      const content = ensureContent(
        errorTitle,
        message,
        defaultTitleForType('error'),
        defaultDescriptionForType('error'),
      );
      return {
        ...baseConfig.value,
        ...content,
      };
    },
  });

  lastId.value = pending.toastId;
}

function push(typeOverride?: ToastType) {
  const toastType = typeOverride ?? type.value;

  if (toastType === 'loading') {
    pushLoading();
    return;
  }

  const resolvedTitle = resolveContent(
    title.value,
    defaultTitleForType(toastType),
    fallbackTitle.value,
  );
  const resolvedDescription = resolveContent(
    description.value,
    defaultDescriptionForType(toastType),
    fallbackDescription.value,
  );

  const content = ensureContent(
    resolvedTitle,
    resolvedDescription,
    defaultTitleForType(toastType),
    defaultDescriptionForType(toastType),
  );

  lastId.value = toast.show({
    ...baseConfig.value,
    type: toastType,
    ...content,
  });
}

function pushBurst() {
  for (let i = 0; i < 5; i += 1) {
    push(type.value);
  }
}

function updateLast() {
  if (!lastId.value) {
    return;
  }

  const updatedTitle = resolveContent(title.value, 'Updated toast', fallbackTitle.value);
  const updatedDescription = resolveContent(
    description.value,
    'This toast was updated from the Toastflow playground.',
    fallbackDescription.value,
  );

  toast.update(lastId.value, {
    title: updatedTitle ? `${updatedTitle} (updated)` : '',
    description: updatedDescription,
  });
}

function resetToDefaults() {
  position.value = 'top-right';
  alignment.value = 'left';
  progressAlignment.value = 'right-to-left';
  type.value = 'success';

  offset.value = '16px';
  gap.value = '8px';
  zIndex.value = 9999;
  width.value = '350px';
  overflowScroll.value = false;

  duration.value = 5000;
  maxVisible.value = 5;

  preventDuplicates.value = false;
  order.value = 'newest';

  progressBar.value = true;
  pauseOnHover.value = true;
  pauseStrategy.value = 'resume';

  closeButton.value = true;
  closeOnClick.value = false;

  supportHtml.value = false;

  showCreatedAt.value = false;

  enableButtons.value = false;
  buttonsAlignment.value = 'bottom-right';
  buttonsGap.value = '';
  buttonsContentGap.value = '';
  playgroundButtons.value = [
    createPlaygroundButton({ value: 'Undo', dismissOnClick: true }),
    createPlaygroundButton({
      mode: 'html',
      value:
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    }),
  ];

  useOnMount.value = false;
  useOnUnmount.value = false;
  useOnClick.value = false;
  useOnClose.value = false;

  title.value = '';
  description.value = '';
  fallbackTitle.value = true;
  fallbackDescription.value = true;
}

function addPlaygroundButton() {
  playgroundButtons.value = [...playgroundButtons.value, createPlaygroundButton()];
}

function removePlaygroundButton(id: string) {
  playgroundButtons.value = playgroundButtons.value.filter((button) => button.id !== id);
}

function updatePlaygroundButton(id: string, updates: Partial<PlaygroundButton>) {
  playgroundButtons.value = playgroundButtons.value.map((button) =>
    button.id === id ? { ...button, ...updates } : button,
  );
}
</script>

<template>
  <div
    class="w-full max-w-5xl rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-200 backdrop-blur-md grid gap-6"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="ml-2 hidden text-xs text-slate-500 md:inline">
        Configure options and push toasts to see them in action.
      </p>

      <div
        class="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] text-slate-500"
      >
        <span>Last toast ID:</span>
        <span class="font-mono text-[0.7rem] text-slate-700">
          {{ lastId ?? '—' }}
        </span>
      </div>
    </div>

    <div class="grid gap-5 text-xs lg:grid-cols-4 md:text-sm">
      <PositionCard
        v-model:position="position"
        v-model:alignment="alignment"
        v-model:progressAlignment="progressAlignment"
        v-model:type="type"
      />

      <BehaviorCard
        v-model:preventDuplicates="preventDuplicates"
        v-model:progressBar="progressBar"
        v-model:pauseOnHover="pauseOnHover"
        v-model:closeButton="closeButton"
        v-model:closeOnClick="closeOnClick"
        v-model:supportHtml="supportHtml"
        v-model:showCreatedAt="showCreatedAt"
        v-model:enableButtons="enableButtons"
        v-model:buttonsAlignment="buttonsAlignment"
        v-model:buttonsGap="buttonsGap"
        v-model:buttonsContentGap="buttonsContentGap"
        v-model:order="order"
        v-model:pauseStrategy="pauseStrategy"
        v-model:overflowScroll="overflowScroll"
        :playground-buttons="playgroundButtons"
        @add-button="addPlaygroundButton"
        @remove-button="removePlaygroundButton"
        @update-button="updatePlaygroundButton"
      />

      <TimingLayoutCard
        v-model:duration="duration"
        v-model:maxVisible="maxVisible"
        v-model:offset="offset"
        v-model:gap="gap"
        v-model:width="width"
        v-model:zIndex="zIndex"
      />

      <ContentCard
        v-model:useOnMount="useOnMount"
        v-model:useOnUnmount="useOnUnmount"
        v-model:useOnClick="useOnClick"
        v-model:useOnClose="useOnClose"
        v-model:title="title"
        v-model:description="description"
        v-model:fallbackTitle="fallbackTitle"
        v-model:fallbackDescription="fallbackDescription"
      />
    </div>

    <ActionsFooter
      @push="push()"
      @push-burst="pushBurst"
      @update-last="updateLast"
      @dismiss-all="toast.dismissAll"
      @reset="resetToDefaults"
    />
  </div>
</template>
