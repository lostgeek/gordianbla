export function useGordian() {
  const puzzleAttr = ref({});
  const correctCard = ref(null);

  const guesses = ref([]);

  async function fetchPuzzle(cards, id) {
    // Returns SVG of gordian puzzle
    var url = "/api/fetch_daily_puzzle";
    if (id > -1) {
      url += `?n=${id}`;
    }

    const data = await $fetch(url);
    const cardSvg = await data.text();

    const lines = cardSvg.split("\n");
    const svgStart = lines.findIndex((l) => l.startsWith("<svg"));
    const comment = lines.slice(0, svgStart);

    var metaData = {};
    comment.forEach(function (line) {
      line = line.replace('<!--', '').replace('-->', '');
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

    // ToDo: Add handling for TD cards
    const correctTitle = puzzleAttr.value.title;
    correctCard.value = cards.filter(function (c) {
      return c.title == correctTitle;
    })[0];

    return cardSvg;
  }

  async function startPuzzle(cards, id, initialGuesses=null) {
    // Returns SVG of gordian puzzle
    const cardSvg = await fetchPuzzle(cards, id);

    if(initialGuesses) {
      guesses.value = initialGuesses;
    } else {
      guesses.value = [
        { state: "not-guessed" },
        { state: "not-guessed" },
        { state: "not-guessed" },
        { state: "not-guessed" },
        { state: "not-guessed" },
        { state: "not-guessed" },
      ];
    }

    return cardSvg;
  }

  // Returns -1, if no guesses remaining
  const currentGuess = computed((state) =>
    guesses.value.findIndex((g) => g.state == "not-guessed")
  );

  const solved = computed((state) => {
    if (guesses.value.length == 0) {
      // guesses not yet initialised
      return false;
    }
    if (currentGuess.value == -1) {
      // last guess
      return true;
    }

    return (
      guesses.value.findIndex(
        (g) => g.state == "guessed" && g.checks.title == true
      ) > -1
    );
  });

  function guess(card) {
    if (currentGuess.value == -1 || solved.value) {
      return;
    }

    var newGuess = { state: "guessed", guessedTitle: card.title, checks: {} };

    /* Title */
    if (correctCard.pack_code == 'tdc') {
      // Filter TD alternate cards
      if (correctCard.pack_code == 'tdc') {
          var parts = correctCard.title.split(" ");
          correctCard.stripped_title = parts.filter(p => !['2', '3', '4', 'A', 'B'].includes(p)).join(' ');
      }
    }
    newGuess.checks.title = card.stripped_title == correctCard.value.stripped_title;

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
    puzzleAttr,
    correctCard,
    guesses,
    // getters
    currentGuess,
    solved,
    // actions
    fetchPuzzle,
    startPuzzle,
    guess,
  };
}