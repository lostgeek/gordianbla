<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
a:not(.p-menuitem-link) {
  color: var(--highlight-text-color);
  text-decoration: underline;
  cursor: pointer;

  &.p-button {
    text-decoration: none;
  }
}
</style>