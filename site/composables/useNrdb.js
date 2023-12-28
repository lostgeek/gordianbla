export const useNrdb = defineStore("nrdbStore", {
  state: () => ({
    cards: [],
    imageUrlTemplate: "",
  }),
  actions: {
    async fetch() {
      const data = await $fetch("https://netrunnerdb.com/api/2.0/public/cards");

      this.cards = data.data;
      this.imageUrlTemplate = data.imageUrlTemplate;
    },
  },
});

// export const useNrdbCards = () => {
//   const cards = ref(null);
//   const imageUrlTemplate = ref(null);
//   const error = ref(null);

//   useFetch("https://netrunnerdb.com/api/2.0/public/cards", {
//     key: "NRDB_Cards",
//     watch: false,
//     default: () => null,
//   })
//     .then(({ data }) => {
//       cards.value = data.value.data;
//       imageUrlTemplate.value = data.value.imageUrlTemplate;
//     })
//     .catch((err) => (error.value = err));

//   return { cards, imageUrlTemplate, error };
// };
