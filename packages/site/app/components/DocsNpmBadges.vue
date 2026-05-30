<script setup lang="ts">
import { computed } from "vue";

type ParsedPackage = {
  name: string;
  color: string;
  label: string;
};

const props = withDefaults(
  defineProps<{
    packages: string;
    downloads?: boolean;
  }>(),
  {
    downloads: false,
  },
);

const packageItems = computed<ParsedPackage[]>(function () {
  return props.packages
    .split(",")
    .map(function (raw) {
      const [name = "", color = "64748b", label] = raw
        .split(":")
        .map((part) => part.trim());

      return {
        name,
        color,
        label: label || name,
      };
    })
    .filter((item) => item.name.length > 0);
});

const badges = computed(function () {
  return packageItems.value.flatMap(function (item) {
    const href = `https://www.npmjs.com/package/${item.name}`;
    const versionBadge = {
      href,
      src: `https://img.shields.io/npm/v/${item.name}?label=${encodeURIComponent(item.label)}&color=${item.color}&style=flat-square`,
      alt: `${item.label} npm version`,
    };

    if (!props.downloads) {
      return [versionBadge];
    }

    return [
      versionBadge,
      {
        href,
        src: `https://img.shields.io/npm/dm/${item.name}?label=downloads&color=${item.color}&style=flat-square`,
        alt: `${item.label} npm downloads`,
      },
    ];
  });
});
</script>

<template>
  <div class="docs-npm-badges" aria-label="npm package badges">
    <a
      v-for="badge in badges"
      :key="badge.src"
      class="docs-npm-badge"
      :href="badge.href"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="badge.alt"
    >
      <img :src="badge.src" :alt="badge.alt" loading="lazy" />
    </a>
  </div>
</template>

<style scoped>
.docs-npm-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  margin: 1rem 0 1.25rem;
}

.docs-npm-badge {
  display: inline-flex;
  line-height: 0;
  text-decoration: none;
  border-radius: 3px;
  outline-offset: 3px;
}

.docs-npm-badge img {
  display: block;
  width: auto;
  max-width: none;
  height: 20px;
  margin: 0;
  border-radius: 0;
}
</style>
