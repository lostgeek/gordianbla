// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: [
    "nuxt-primevue",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxt/content",
    "@nuxtjs/plausible",
  ],
  primevue: {
    options: {
      ripple: true
    },
  },
  css: ["@fontsource/patua-one", "@fontsource/medula-one"],
  app: {
    head: {
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
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
        {
          rel: "mask-icon",
          href: "/safari-pinned-tab.svg",
          color: "#5bbad5",
        },
      ],
      meta: [
        {
          name: "msapplication-TileColor",
          content: "#da532c",
        },
        {
          name: "theme-color",
          content: "#ffffff",
        },
      ],
    },
  },
  pages: true,
  plausible: {
    apiHost: "https://gordianbla.de",
  }
});
