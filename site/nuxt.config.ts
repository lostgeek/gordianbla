// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: [
    "nuxt-primevue",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
  ],
  primevue: {
    options: {
      ripple: true
    },
  },
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