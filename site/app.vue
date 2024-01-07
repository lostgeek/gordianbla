<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
a.p-component {
  text-decoration: none;
}

a:not(.p-component) {
  color: var(--highlight-text-color);
  text-decoration: underline;
  cursor: pointer;

  &.p-button {
    text-decoration: none;
  }
}
</style>