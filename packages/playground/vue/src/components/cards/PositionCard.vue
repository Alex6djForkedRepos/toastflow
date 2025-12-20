<script setup lang="ts">
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  MoveLeft,
  MoveRight,
} from 'lucide-vue-next';
import type { Component } from 'vue';
import type { ToastAlignment, ToastProgressAlignment } from 'vue-toastflow';
import type { ToastPosition, ToastType } from 'toastflow-core';
import SectionHeading from '../SectionHeading.vue';
import ToggleGrid from '../ToggleGrid.vue';
import Button from '../Button.vue';
import Card from '@/components/card/Card.vue';
import CardLayout from '@/components/card/CardLayout.vue';

const props = defineProps<{
  position: ToastPosition;
  alignment: ToastAlignment;
  progressAlignment: ToastProgressAlignment;
  type: ToastType;
}>();

const emit = defineEmits<{
  'update:position': [ToastPosition];
  'update:alignment': [ToastAlignment];
  'update:progressAlignment': [ToastProgressAlignment];
  'update:type': [ToastType];
}>();

const positionOptions: { value: ToastPosition; label: string; icon: Component }[] = [
  { value: 'top-left', label: 'Left', icon: ArrowUpLeft },
  { value: 'top-center', label: 'Center', icon: ArrowUp },
  { value: 'top-right', label: 'Right', icon: ArrowUpRight },
  { value: 'bottom-left', label: 'Left', icon: ArrowDownLeft },
  { value: 'bottom-center', label: 'Center', icon: ArrowDown },
  { value: 'bottom-right', label: 'Right', icon: ArrowDownRight },
];

const alignmentOptions: { value: ToastAlignment; label: string; icon: Component }[] = [
  { value: 'left', label: 'Left', icon: ArrowLeft },
  { value: 'right', label: 'Right', icon: ArrowRight },
];

const progressAlignmentOptions: {
  value: ToastProgressAlignment;
  label: string;
  icon: Component;
}[] = [
  { value: 'left-to-right', label: 'Left-to-right', icon: MoveRight },
  { value: 'right-to-left', label: 'Right-to-left', icon: MoveLeft },
];

const typeOptions: { value: ToastType; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'loading', label: 'Loading' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];
</script>

<template>
  <Card>
    <div>
      <SectionHeading text="Position" />
      <ToggleGrid
        :options="positionOptions"
        :active-value="position"
        :columns="3"
        @update:value="emit('update:position', $event as ToastPosition)"
      />
    </div>

    <div>
      <SectionHeading text="Data Alignment" is-new />
      <ToggleGrid
        :options="alignmentOptions"
        :active-value="alignment"
        :columns="2"
        @update:value="emit('update:alignment', $event as ToastAlignment)"
      />
    </div>

    <div>
      <SectionHeading text="Progress Alignment" is-new />
      <ToggleGrid
        :options="progressAlignmentOptions"
        :active-value="progressAlignment"
        :columns="2"
        @update:value="emit('update:progressAlignment', $event as ToastProgressAlignment)"
      />
    </div>

    <div>
      <SectionHeading text="Type" />
      <CardLayout wrap>
        <Button
          v-for="t in typeOptions"
          :key="t.value"
          variant="pill"
          :model-value="type === t.value"
          @click="emit('update:type', t.value)"
          class="gap-2"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="{
              'bg-gray-600': t.value === 'default',
              'bg-yellow-600': t.value === 'loading',
              'bg-emerald-600': t.value === 'success',
              'bg-rose-600': t.value === 'error',
              'bg-amber-600': t.value === 'warning',
              'bg-sky-600': t.value === 'info',
            }"
          />
          <span>{{ t.label }}</span>
        </Button>
      </CardLayout>
    </div>
  </Card>
</template>
