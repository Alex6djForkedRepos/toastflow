<script setup lang="ts">
import Button from '../Button.vue';
import InputField from '../InputField.vue';
import Card from '@/components/card/Card.vue';
import SectionHeading from '@/components/SectionHeading.vue';
import CardLayout from '@/components/card/CardLayout.vue';

const props = defineProps<{
  useOnMount: boolean;
  useOnUnmount: boolean;
  useOnClick: boolean;
  useOnClose: boolean;
  title: string;
  description: string;
  fallbackTitle: boolean;
  fallbackDescription: boolean;
}>();

const emit = defineEmits<{
  'update:useOnMount': [boolean];
  'update:useOnUnmount': [boolean];
  'update:useOnClick': [boolean];
  'update:useOnClose': [boolean];
  'update:title': [string];
  'update:description': [string];
  'update:fallbackTitle': [boolean];
  'update:fallbackDescription': [boolean];
}>();
</script>

<template>
  <Card>
    <div>
      <SectionHeading text="Events (console.log)" />
      <CardLayout wrap>
        <Button
          variant="pill"
          :model-value="useOnMount"
          @update:model-value="emit('update:useOnMount', $event)"
        >
          onMount
        </Button>

        <Button
          variant="pill"
          :model-value="useOnUnmount"
          @update:model-value="emit('update:useOnUnmount', $event)"
        >
          onUnmount
        </Button>

        <Button
          variant="pill"
          :model-value="useOnClick"
          @update:model-value="emit('update:useOnClick', $event)"
        >
          onClick
        </Button>

        <Button
          variant="pill"
          :model-value="useOnClose"
          @update:model-value="emit('update:useOnClose', $event)"
        >
          onClose
        </Button>
      </CardLayout>
    </div>

    <div>
      <SectionHeading text="Content" />
      <CardLayout>
        <InputField
          label="Title"
          :model-value="title"
          placeholder="Saved"
          @update:model-value="emit('update:title', $event as string)"
        />

        <InputField
          label="Description"
          :model-value="description"
          placeholder="Your changes have been stored."
          @update:model-value="emit('update:description', $event as string)"
        />
      </CardLayout>

      <CardLayout wrap class="py-2">
        <Button
          variant="pill"
          :model-value="fallbackTitle"
          @update:model-value="emit('update:fallbackTitle', $event)"
        >
          Fallback title
        </Button>

        <Button
          variant="pill"
          :model-value="fallbackDescription"
          @update:model-value="emit('update:fallbackDescription', $event)"
        >
          Fallback description
        </Button>
      </CardLayout>
      <p class="text-[0.65rem] text-slate-400">
        At least one of title/description is required. Leave one empty if you want, but if both are
        blank we will auto-fill defaults (logging a warning).
      </p>
    </div>
  </Card>
</template>
