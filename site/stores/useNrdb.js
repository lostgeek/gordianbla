export const useNrdb = defineStore("nrdbStore", {
  state: () => ({
    cards: [],
    imageUrlTemplate: "",
    packs: [],
  }),
  actions: {
    packsInCycles(cycleCodes) {
      return this.packs.filter((p) => cycleCodes.includes(p.cycle_code));
    },
    async fetch(reload=false) {
      if(this.cards.length == 0 || reload) {
        const data = await $fetch("https://netrunnerdb.com/api/2.0/public/cards");

        this.cards = data.data;
        this.imageUrlTemplate = data.imageUrlTemplate;
      }
      if(this.packs.length == 0 || reload) {
        const data = await $fetch("https://netrunnerdb.com/api/2.0/public/packs");

        this.packs = data.data;
      }
    },
  },
});