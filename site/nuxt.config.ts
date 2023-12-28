// https://nuxt.com/docs/api/configuration/nuxt-config
const baseURL = "/";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["nuxt-primevue"],
  primevue: {},
  app: {
    baseURL: baseURL,
  },
  pages: true,
});
