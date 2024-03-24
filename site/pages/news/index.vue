<template>
  <div class="news">
    <Paginator v-model:first="first" v-model:rows="rows" :total-records="totalArticles" />
    <Card v-for="article in articles" :key="article._path" class="article">
      <template #title>
        {{ article.title }}
      </template>
      <template #subtitle>
        Published: {{ toLocaleDateString(article.publishedAt) }}
      </template>
      <template #content>
        <ContentRenderer :excerpt="true" :value="article" />
        <NuxtLink :to="article._path">
          Continue reading...
        </NuxtLink>
      </template>
    </Card>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Gordian Blade - News',
  ogTitle: 'Gordian Blade - News',
  description: 'The daily Netrunner puzzle!',
  ogDescription: 'The daily Netrunner puzzle!',
  ogImage: 'https://gordianbla.de/android-chrome-192x192.png',
  twitterCard: 'summary_large_image',
})
const { data: totalArticles } = await useAsyncData('newsCount', () => queryContent('news').count())
const first = ref(0)
const rows = ref(5)
const { data: articles } = await useAsyncData('newsArticles', () => queryContent('news')
  .sort({ publishedAt: -1 })
  .skip(first.value)
  .limit(rows.value)
  .find(), { watch: [first, rows] })

// Update user to note the newest article viewed
const user = useUser()
const { data: newestArticle, error } = await useAsyncData('newestArticle', () => queryContent('news')
  .sort({ publishedAt: -1 })
  .find(), { transform: articles => articles[0] }) // findOne does not work for some reason
if (!error.value) {
  if (newestArticle.value.id)
    user.newestArticleViewed = newestArticle.value.id
}

function toLocaleDateString(str) {
  const d = new Date(str)
  return d.toLocaleDateString()
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
