import svgUrl from '~/assets/LIB_RWR_48.svg';

export async function useHoloNet() {
  const guesses = ref([]);
  const realHits = ref(0);

  const svgDOM = ref();

  const words = ref([]);

  const rulesIndices = [83, 81, 80, 79, 78, 77, 76, 74, 73, 72, 71, 70, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 10, 11];
  const percentageRules = computed(() => {
    if(!words.value) {
      return 0;
    }

    let count = 0;
    rulesIndices.forEach((idx) => {
      if(words.value[idx].revealed) {
        count++;
      }
    });

    return count / rulesIndices.length;
  });

  const fullReveal = ref(false);

  await fetch(svgUrl)
    .then((response) => response.text())
    .then((text) => {
      var parser = new DOMParser();
      var svg = parser.parseFromString(text, "text/xml");

      svgDOM.value = svg.children[0];
      words.value = Array.from(svg.children[0].children).slice(1).map((word) => {
        var w_id = word.getAttribute('id');
        if (word.getAttribute('serif:id') != null) {
          w_id = word.getAttribute('serif:id');
        }
        return {word: w_id ?? '', revealed: false};
      });
    });

  function guess(word) {
    if(guesses.value.map((g) => g.word).includes(word)) {
      guesses.value.push({ word: word, hits: null });
      return;
    }

    let hits = 0;
    Array.from(words.value).forEach(({word:w}) => {
      if (word.toLowerCase() == w.toLowerCase()) {
        hits++;

        if(![".",",","-",":","\""].includes(w.toLowerCase())) {
          realHits.value++;
        }
      }
    });
    guesses.value.push({ word: word, hits: hits });

    words.value = words.value.map((x) => {
      if(x.word.toLowerCase() === word.toLowerCase()) {
        x.revealed = true;
      }
      return x
    })
  }

  return {
    guesses,
    realHits,
    svgDOM,
    words,
    percentageRules,
    fullReveal,

    guess,
  };
}
