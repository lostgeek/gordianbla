<template>
    <div class="news">
        <Paginator v-model:first="first" v-model:rows="rows" :total-records="totalArticles">
        </Paginator>
        <Card class="article" v-for="article in articles" :key="article._path">
            <template #title>{{ article.title }}</template>
            <template #subtitle>Published: {{ toLocaleDateString(article.publishedAt) }}</template>
            <template #content>
                <ContentRenderer :excerpt="true" :value="article" />
                <NuxtLink :to="article._path">Continue reading...</NuxtLink></template>
        </Card>
    </div>
</template>

<script setup>
const { data:totalArticles } = await useAsyncData('newsCount', () => queryContent('news').count());
const first = ref(0);
const rows = ref(5);
const { data: articles } = await useAsyncData('newsArticles', () => queryContent('news')
    .sort({ publishedAt: -1 })
    .skip(first.value)
    .limit(rows.value)
    .find(),
    { watch: [first, rows]});

function toLocaleDateString(str) {
    const d = new Date(str);
    return d.toLocaleDateString();
}
</script>

<style lang="scss" scoped>
.news {
    max-width: 40rem;
    width: 70vw;
    margin: 0 auto;

    @media(max-width:400px) {
        width: 100%;
    }

    &>div:not(:first-child) {
        margin-top: 1rem;
    }
}
</style>