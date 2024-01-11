<template>
    <div class="news">
        <ContentDoc>
            <template #default="{ doc:article }">
                <div class="title">
                    <h1>{{ article.title }}</h1>
                    <div class="subtitle">Published: {{ toLocaleDateString(article.publishedAt) }}</div>
                </div>
                <ContentRenderer :value="article" />
            </template>
            <template #not-found>
                <h1>Article not found</h1>
            </template>
        </ContentDoc>
    </div>
</template>

<script setup>
const route = useRoute();

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
}
.title {
    margin-bottom: 1rem;
    h1 {
        margin-bottom: 0;
    }
    .subtitle {
        color: var(--text-color-secondary);
    }
}
</style>