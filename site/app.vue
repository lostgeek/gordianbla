<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
useSeoMeta({
  title: 'Gordian Blade',
  ogTitle: 'Gordian Blade',
  description: 'The daily Netrunner puzzle!',
  ogDescription: 'The daily Netrunner puzzle!',
  ogImage: 'https://gordianbla.de/android-chrome-192x192.png',
  twitterCard: 'summary_large_image',
})
</script>

<style lang="scss">
html {
  background: var(--background-color);
  background-repeat: no-repeat;
  background-attachment: fixed;
  width: 100%;
  height: 100%;
  color: var(--text-color);
}

p {
  hyphens: auto;
  text-align: justify;
}

h1>a, h2>a, h3>a, h4>a, h5>a, h6>a {
  color: var(--text-color)!important;
  text-decoration: none!important;
  cursor: pointer!important;
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