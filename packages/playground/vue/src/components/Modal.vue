<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Button from '@/components/Button.vue';
import { X } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
  }>(),
  {
    title: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [boolean];
}>();

const offsetX = ref(0);
const offsetY = ref(0);
const dragging = ref(false);
let startPointer = { x: 0, y: 0 };
let startOffset = { x: 0, y: 0 };

const modalStyle = computed(function () {
  return {
    transform: `translate(${offsetX.value}px, ${offsetY.value}px)`,
  };
});

function close() {
  emit('update:modelValue', false);
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement | null;
  if (target && target.closest('button')) {
    return;
  }
  dragging.value = true;
  startPointer = { x: event.clientX, y: event.clientY };
  startOffset = { x: offsetX.value, y: offsetY.value };
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) {
    return;
  }
  offsetX.value = startOffset.x + (event.clientX - startPointer.x);
  offsetY.value = startOffset.y + (event.clientY - startPointer.y);
}

function onPointerUp() {
  dragging.value = false;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) {
    close();
  }
}

onMounted(function () {
  offsetX.value = 0;
  offsetY.value = 0;
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown', onKeyDown);
});

watch(
  function () {
    return props.modelValue;
  },
  function (isOpen) {
    if (isOpen) {
      offsetX.value = 0;
      offsetY.value = 0;
    }
  },
);

onBeforeUnmount(function () {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none"
    >
      <div
        class="relative w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 pointer-events-auto overscroll-contain"
        :style="modalStyle"
      >
        <header
          class="mb-4 flex items-center justify-between gap-3 cursor-move select-none"
          @pointerdown="onPointerDown"
        >
          <h3 class="text-sm font-semibold text-slate-800">
            {{ title }}
          </h3>
          <Button variant="ghost" icon-only tooltip="Close" @click="close">
            <X class="size-4" />
          </Button>
        </header>

        <div class="max-h-[50vh] overflow-auto">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>
