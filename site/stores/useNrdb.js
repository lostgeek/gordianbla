export const useNrdb = defineStore("nrdbStore", {
  state: () => ({
    cards: [],
    imageUrlTemplate: "",
  }),
  actions: {
    async fetch(reload=false) {
      if(this.cards.length == 0 || reload) {
        const data = await $fetch("https://netrunnerdb.com/api/2.0/public/cards");

        this.cards = data.data;
        this.imageUrlTemplate = data.imageUrlTemplate;
      }
    },
  },
});