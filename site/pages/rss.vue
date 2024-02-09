<template>
    <div class="rss">
        <h1>RSS Feeds</h1>
        <h2>Daily puzzles</h2>
        <ul>
            <li><NuxtLink to="/api/rss/daily" target="_blank">Eternal (default)</NuxtLink></li>
            <li><NuxtLink to="/api/rss/daily/standard" target="_blank">Standard</NuxtLink></li>
            <li><NuxtLink to="/api/rss/daily/neo" target="_blank">Neo (All-NSG)</NuxtLink></li>
            <li><NuxtLink to="/api/rss/daily/startup" target="_blank">Startup</NuxtLink></li>
        </ul>
    </div>
</template>

<script setup>
useSeoMeta({
  title: "Gordian Blade - RSS Feeds",
  ogTitle: "Gordian Blade - RSS Feeds",
  description: 'The daily Netrunner puzzle!',
  ogDescription: 'The daily Netrunner puzzle!',
  ogImage: 'https://gordianbla.de/android-chrome-192x192.png',
  twitterCard: 'summary_large_image',
})
</script>

<style lang="scss" scoped>
.rss {
    max-width: 40rem;
    width: 70vw;
    margin: 0 auto;

    @media(max-width:400px) {
        width: 100%;
    }
}
</style>