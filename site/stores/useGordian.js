export const useGordian = defineStore("gordianStore", () => {
  const currentDaily = ref(0);
  async function init() {
    const data = await $fetch('/api/current_daily_puzzle');
    currentDaily.value = data.daily;
  }

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
    cardSvg.value = await data.text();

    const lines = cardSvg.value.split("\n");
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
    correctCard.value = nrdb.cards.filter(function (c) {
      return c.title == correctTitle;
    })[0];
  }

  async function startPuzzle(id=-1) {
    await fetchPuzzle(id);
    await nrdb.fetch();

    if (puzzleAttr.value.dailyNumber > -1 && puzzleAttr.value.dailyNumber in history.value) {
      guesses.value = history.value[puzzleAttr.value.dailyNumber];
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
  }

  // Returns -1, if no guesses remaining
  const currentGuess = computed((state) =>
    guesses.value.findIndex((g) => g.state == "not-guessed")
  );

  const solved = computed((state) =>
    guesses.value.findIndex((g) => g.state == "guessed" && g.checks.title == true) > -1
  );

  const stats = computed((state) => {
    var res = { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: [0,10,20,30,40,50]};

    res.played = Object.values(history.value).filter(g => (g.findIndex((x) => x.state == 'guessed')>=0)).length;
    res.wins = Object.values(history.value).filter(g => (g.findIndex((x) => x.checks.title)>=0)).length;

    var streak = 0;
    for(var i = currentDaily.value; i >= 0; i--) {
      if (i in history.value && history.value[i].findIndex((x) => x.checks.title)>=0) {
        streak++;
      } else {
        break;
      }
    }
    res.streak = streak;
    var maxStreak = 0;
    var currStreak = 0;
    for(var i = 0; i >= 0; i--) {
      if (i in history.value && history.value[i].findIndex((x) => x.checks.title)>=0) {
        currStreak++;
      } else {
        if (currStreak > maxStreak) {
          maxStreak = currStreak;
          currStreak = 0;
        }
      }
    }
    if (currStreak > maxStreak) {
      maxStreak = currStreak;
    }
    res.maxStreak = maxStreak;

    var distribution = [0, 0, 0, 0, 0, 0];
    Object.values(history.value).forEach(g => {
      var usedGuesses = g.findIndex((x) => x.checks.title);
      if(usedGuesses > -1) {
        distribution[usedGuesses]++;
      }
    });
    res.distribution = distribution;

    return res;
  }
  );

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
    if (puzzleAttr.value.dailyNumber > -1) {
      history.value[puzzleAttr.value.dailyNumber] = guesses.value;
    }
  }

  return {
    // state
    currentDaily,
    puzzleAttr,
    correctCard,
    cardSvg,
    guesses,
    history,
    // getters
    currentGuess,
    solved,
    stats,
    // actions
    init,
    fetchPuzzle,
    startPuzzle,
    guess,
  };
}, {persist: {storage: localStorage}});