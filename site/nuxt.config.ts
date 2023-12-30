// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["nuxt-primevue", "@pinia/nuxt"],
  primevue: {},
  css: ["@fontsource/patua-one", "@fontsource/medula-one"],
  app: {
    head: {
      // script: [
      //   {
      //     src: "/fontawesome/js/brands.min.js",
      //     defer: true,
      //   },
      //   {
      //     src: "/fontawesome/js/solid.min.js",
      //     defer: true,
      //   },
      //   {
      //     src: "/fontawesome/js/fontawesome.min.js",
      //     defer: true,
      //   },
      // ],
      link: [
        {
          rel: "stylesheet",
          href: "/fontawesome/css/fontawesome.css",
        },
        {
          rel: "stylesheet",
          href: "/fontawesome/css/solid.css",
        },
        {
          rel: "stylesheet",
          href: "/fontawesome/css/brands.css",
        },
      ],
    },
  },
  pages: true,
});