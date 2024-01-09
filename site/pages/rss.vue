<template>
    <div class="rss">
        <h1>RSS Feeds</h1>
        <ul>
            <li><NuxtLink to="/api/rss/daily" target="_blank">Daily Puzzle</NuxtLink></li>
        </ul>
    </div>
</template>

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