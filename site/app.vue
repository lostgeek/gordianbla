<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
html {
  background: var(--background-color);
  background-repeat: no-repeat;
  background-attachment: fixed; 
  width: 100%;
  height: 100%;
}

a:not(.p-menuitem-link) {
  color: var(--highlight-text-color);
  text-decoration: underline;
  cursor: pointer;

  &.p-button {
    text-decoration: none;
  }
}
</style>