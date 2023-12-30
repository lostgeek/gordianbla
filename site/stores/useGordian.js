// function evaluateGuess(correctCard, guessedTitle) {
//   guessedCard = nrdb.cards.filter(function (c) {
//     return c.title == guessedTitle;
//   })[0];
//   newGuess = { guessedTitle: guessedTitle };
// }

export const useGordian = defineStore("gordianStore", () => {
  const puzzle_id = ref(-1);
  const puzzleAttr = ref({});
  const correctCard = ref(null);
  const cardSvg = ref(null);

  const guesses = ref([]);
  const history = ref({});

  const nrdb = useNrdb();

  async function fetchPuzzle(id = -1) {
    var url = "/api/fetch_daily_puzzle";
    if (id > -1) {
      url += `?n=${id}`;
    }

    const data = await $fetch(url);
    const ds = new DecompressionStream("gzip");
    const decompressedStream = data.stream().pipeThrough(ds);
    cardSvg.value = await (
      await new Response(decompressedStream).blob()
    ).text();

    const lines = cardSvg.value.split("\n");
    const comment_start = lines.findIndex((l) => l == "<!--");
    const comment_end = lines.findIndex((l) => l == "-->");
    const comment = lines.slice(comment_start + 1, comment_end);

    var metaData = {};
    comment.forEach(function (line) {
      const parts = line.split(": ");
      if (parts.length >= 2) {
        const key = parts.shift();
        const value = parts.join(": ");
        metaData[key] = value;
      }
    });

    if (metaData["Title"]) {
      puzzleAttr.value.title = metaData["Title"];
    } else {
      puzzleAttr.value.title = "";
    }

    if (metaData["NRDB ID"]) {
      puzzleAttr.value.nrdbID = metaData["NRDB ID"];
    } else {
      puzzleAttr.value.nrdbID = "";
    }

    if (metaData["Mode"]) {
      puzzleAttr.value.mode = metaData["Mode"].split(" ")[1];
    } else {
      puzzleAttr.value.mode = "";
    }

    if (metaData["n"]) {
      puzzleAttr.value.maxElements = metaData["n"];
    } else {
      puzzleAttr.value.maxElements = 100;
    }

    if (metaData["additional"]) {
      puzzleAttr.value.additional = metaData["additional"].split(",");
    } else {
      puzzleAttr.value.additional = [];
    }

    if (metaData["daily"]) {
      puzzleAttr.value.dailyNumber = parseInt(metaData["daily"]);
    } else {
      puzzleAttr.value.dailyNumber = -1;
    }
  }

  async function startPuzzle(id) {
    if (puzzle_id.value == id) {
      return;
    }

    await fetchPuzzle(id);
    await nrdb.fetch();

    puzzle_id.value = id;
    const correctTitle = puzzleAttr.value.title;
    correctCard.value = nrdb.cards.filter(function (c) {
      return c.title == correctTitle;
    })[0];
    // ToDo: Add handling for TD cards

    guesses.value = [
      { state: "not-guessed" },
      { state: "not-guessed" },
      { state: "not-guessed" },
      { state: "not-guessed" },
      { state: "not-guessed" },
      { state: "not-guessed" },
    ];
  }

  // Returns -1, if no guesses remaining
  const currentGuess = computed(() =>
    guesses.value.findIndex((g) => g.state == "not-guessed")
  );

  function guess(card) {
    if (currentGuess.value == -1) {
      return;
    }

    var newGuess = { state: "guessed", guessedTitle: card.title, checks: {} };

    /* Title */
    newGuess.checks.title = card.title == correctCard.value.title;

    /* Faction */
    newGuess.checks.faction = (card.faction_code == correctCard.value.faction_code);

    /* Type */
    newGuess.checks.type = card.type_code == correctCard.value.type_code;

    /* Subtypes */
    var correctTypes = [];
    if (correctCard.value.keywords) {
      correctTypes = correctCard.value.keywords.split(" - ");
    } 

    var cardTypes = [];
    if (card.keywords) {
      cardTypes = card.keywords.split(" - ");
    }

    // How many of the correct types are present on the guessed card?
    var hits = correctTypes.filter(value => cardTypes.includes(value));

    var subtypesClass = "";
    if (correctTypes.length == 0) {
      if (cardTypes.length == 0) {
        subtypesClass = "correct";
      } else {
        subtypesClass = "incorrect";
      }
    } else {
      subtypesClass = `partial-${hits.length}-${correctTypes.length}`;
    }

    newGuess.checks.subtype = {
      hits: hits.length,
      total: correctTypes.length,
      class: subtypesClass,
    };

    /* Cost */
    var costType = ""; // 'cost', 'advancement_cost' or null
    if (correctCard.value.cost) {
      costType = "cost";
    } else if (correctCard.value.advancement_cost) {
      costType = "advancement_cost";
    } else {
      costType = null; // Should not exist
    }

    newGuess.checks.cost = (correctCard.value[costType] == card[costType]);

    guesses.value[currentGuess.value] = newGuess;
  }

  return {
    // state
    puzzle_id,
    puzzleAttr,
    correctCard,
    cardSvg,
    guesses,
    history,
    // getters
    currentGuess,
    // actions
    fetchPuzzle,
    startPuzzle,
    guess,
  };
});
