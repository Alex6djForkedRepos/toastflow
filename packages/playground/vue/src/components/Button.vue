<script setup lang="ts">
import { computed } from 'vue';
import NewBadge from './NewBadge.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    variant?:
      | 'primary'
      | 'primary-muted'
      | 'outline'
      | 'danger'
      | 'subtle'
      | 'toggle'
      | 'pill'
      | 'ghost';
    isNew?: boolean;
    tooltip?: string;
    iconOnly?: boolean;
    ariaLabel?: string;
    href?: string;
    target?: string;
    rel?: string;
  }>(),
  {
    variant: 'outline',
    isNew: false,
    iconOnly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [boolean];
  click: [MouseEvent];
}>();

const isActive = computed(function () {
  return Boolean(props.modelValue);
});

const sizeClass = computed(function () {
  if (props.iconOnly) {
    return 'size-8 justify-center p-0 text-[0.75rem]';
  }
  return 'px-3 py-1 text-[0.8rem]';
});

const shapeClass = computed(function () {
  if (props.variant === 'pill') {
    return 'rounded-full';
  }
  return 'rounded-xl';
});

const variantClass = computed(function () {
  const activeBase = 'tf-btn-toggle-active';
  const inactiveBase = 'tf-btn-toggle-inactive';

  switch (props.variant) {
    case 'primary':
      return 'tf-btn-primary';
    case 'primary-muted':
      return 'tf-btn-primary-muted';
    case 'outline':
      return 'tf-btn-outline';
    case 'danger':
      return 'tf-btn-danger';
    case 'subtle':
      return 'tf-btn-subtle';
    case 'ghost':
      return 'tf-btn-ghost';
    case 'pill':
    case 'toggle':
      return isActive.value ? activeBase : inactiveBase;
    default:
      return inactiveBase;
  }
});

const baseClass = computed(function () {
  return 'tf-btn-base inline-flex items-center gap-2 font-medium transition-colors duration-300 cursor-pointer shrink-0';
});

const newBadgeClass = computed(function () {
  if (props.isNew) {
    return 'flex w-full items-center justify-between';
  }
  return '';
});

function onClick(event: MouseEvent) {
  if (!props.href && props.modelValue !== undefined) {
    emit('update:modelValue', !props.modelValue);
  }
  emit('click', event);
}

const ariaLabelAttr = computed(function () {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }
  if (props.iconOnly && props.tooltip) {
    return props.tooltip;
  }
  return undefined;
});

const relAttr = computed(function () {
  if (props.rel) {
    return props.rel;
  }
  if (props.target === '_blank') {
    return 'noreferrer noopener';
  }
  return undefined;
});
</script>

<template>
  <component
    :is="props.href ? 'a' : 'button'"
    :type="props.href ? undefined : 'button'"
    :href="props.href"
    :target="props.target"
    :rel="relAttr"
    class="btn"
    :class="[baseClass, sizeClass, shapeClass, variantClass, newBadgeClass]"
    :title="props.tooltip || undefined"
    :aria-label="ariaLabelAttr"
    @click="onClick"
  >
    <slot />
    <NewBadge v-if="isNew" />
  </component>
</template>

<style scoped>
.tf-btn-base {
  border: 1px solid transparent;
}

.tf-btn-base:focus-visible {
  outline: 2px solid var(--tf-ui-focus-ring);
  outline-offset: 2px;
}

.tf-btn-primary {
  background: var(--tf-ui-btn-primary-bg);
  border-color: var(--tf-ui-btn-primary-border);
  color: var(--tf-ui-btn-primary-fg);
}

.tf-btn-primary:hover {
  background: var(--tf-ui-btn-primary-bg-hover);
  border-color: var(--tf-ui-btn-primary-border-hover);
}

.tf-btn-primary-muted {
  background: var(--tf-ui-btn-primary-muted-bg);
  border-color: var(--tf-ui-btn-primary-muted-border);
  color: var(--tf-ui-btn-primary-muted-fg);
}

.tf-btn-primary-muted:hover {
  background: var(--tf-ui-btn-primary-muted-bg-hover);
  border-color: var(--tf-ui-btn-primary-muted-border-hover);
}

.tf-btn-outline {
  background: var(--tf-ui-btn-outline-bg);
  border-color: var(--tf-ui-btn-outline-border);
  color: var(--tf-ui-btn-outline-fg);
}

.tf-btn-outline:hover {
  background: var(--tf-ui-btn-outline-bg-hover);
  border-color: var(--tf-ui-btn-outline-border-hover);
}

.tf-btn-subtle {
  background: var(--tf-ui-btn-subtle-bg);
  border-color: var(--tf-ui-btn-subtle-border);
  color: var(--tf-ui-btn-subtle-fg);
}

.tf-btn-subtle:hover {
  background: var(--tf-ui-btn-subtle-bg-hover);
  border-color: var(--tf-ui-btn-subtle-border-hover);
}

.tf-btn-toggle-active {
  background: var(--tf-ui-btn-toggle-active-bg);
  border-color: var(--tf-ui-btn-toggle-active-border);
  color: var(--tf-ui-btn-toggle-active-fg);
}

.tf-btn-toggle-active:hover {
  background: var(--tf-ui-btn-toggle-active-bg-hover);
  border-color: var(--tf-ui-btn-toggle-active-border-hover);
}

.tf-btn-toggle-inactive {
  background: var(--tf-ui-btn-toggle-inactive-bg);
  border-color: var(--tf-ui-btn-toggle-inactive-border);
  color: var(--tf-ui-btn-toggle-inactive-fg);
}

.tf-btn-toggle-inactive:hover {
  background: var(--tf-ui-btn-toggle-inactive-bg-hover);
  border-color: var(--tf-ui-btn-toggle-inactive-border-hover);
}

.tf-btn-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--tf-ui-btn-ghost-fg);
}

.tf-btn-ghost:hover {
  background: var(--tf-ui-btn-ghost-bg-hover);
}

.tf-btn-danger {
  background: var(--tf-ui-btn-danger-bg);
  border-color: var(--tf-ui-btn-danger-border);
  color: var(--tf-ui-btn-danger-fg);
}

.tf-btn-danger:hover {
  background: var(--tf-ui-btn-danger-bg-hover);
  border-color: var(--tf-ui-btn-danger-border-hover);
}
</style>
