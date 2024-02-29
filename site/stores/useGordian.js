export function useGordian() {
    const puzzleAttr = ref({});
    const correctCard = ref(null);

    const guesses = ref([]);

    async function fetchPuzzle(cards, url) {
        // Returns SVG of gordian puzzle

        const data = await $fetch(url);
        const cardSvg = await data.text();

        const lines = cardSvg.split("\n");
        const svgStart = lines.findIndex((l) => l.startsWith("<svg"));
        const comment = lines.slice(0, svgStart);

        var metaData = {};
        comment.forEach(function (line) {
            line = line.replace("<!--", "").replace("-->", "");
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

        correctCard.value = cards.filter(function (c) {
            return c.code == puzzleAttr.value.nrdbID;
        })[0];

        return cardSvg;
    }

    function initiateGuesses(initialGuesses = null) {
        if (initialGuesses) {
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
    }

    async function startDailyPuzzle(
        cards,
        id,
        format = null,
        initialGuesses = null
    ) {
        // Returns SVG of gordian puzzle

        var url = "/api/fetch_daily_puzzle";
        var params = [];
        if (id > -1) {
            params.push(`n=${id}`);
        }
        if (format) {
            params.push(`format=${format}`);
        }
        if (params.length > 0) {
            url += "?" + params.join("&");
        }
        const cardSvg = await fetchPuzzle(cards, url);

        initiateGuesses(initialGuesses);

        return cardSvg;
    }

    async function startPracticePuzzle(cards, packs, initialGuesses = null) {
        // Returns SVG of gordian puzzle
        // packs: comma-separated pack codes

        var url;
        if (packs) {
            url = `/api/fetch_practice_puzzle?packs=${packs}`;
        } else {
            url = "/api/fetch_practice_puzzle";
        }
        const cardSvg = await fetchPuzzle(cards, url);

        initiateGuesses(initialGuesses);

        return cardSvg;
    }

    async function startSpecificPuzzle(
        cards,
        pack,
        code,
        id,
        initialGuesses = null
    ) {
        // Returns SVG of gordian puzzle
        // packs: comma-separated pack codes

        var url = `/api/fetch_puzzle?pack=${pack}&code=${code}&id=${id}`;
        const cardSvg = await fetchPuzzle(cards, url);

        initiateGuesses(initialGuesses);

        return cardSvg;
    }

    // Returns -1, if no guesses remaining
    // Returns null, if guesses not initialised
    const currentGuess = computed((state) => {
        const result = guesses.value.findIndex((g) => g.state == "not-guessed");
        if (result >= 0) {
            return result;
        }

        if (guesses.value.length == 0) {
            // Not initialised yet
            return null;
        } else {
            // Final guess made
            return 6;
        }
    });

    const solved = computed((state) => {
        if (guesses.value.length == 0) {
            // guesses not yet initialised
            return false;
        }

        return (
            guesses.value.findIndex(
                (g) => g.state == "guessed" && g.checks.title == true
            ) > -1
        );
    });

    const finished = computed((state) => {
        return solved.value || currentGuess.value == 6;
    });

    function guess(card) {
        if (currentGuess.value == -1 || solved.value || !correctCard.value) {
            return;
        }

        var newGuess = {
            state: "guessed",
            guessedTitle: card.title,
            checks: {},
        };

        /* Title */
        if (correctCard.pack_code == "tdc") {
            // Filter TD alternate cards
            if (correctCard.pack_code == "tdc") {
                var parts = correctCard.title.split(" ");
                correctCard.stripped_title = parts
                    .filter((p) => !["2", "3", "4", "A", "B"].includes(p))
                    .join(" ");
            }
        }
        newGuess.checks.title =
            card.stripped_title == correctCard.value.stripped_title;

        /* Faction */
        newGuess.checks.faction =
            card.faction_code == correctCard.value.faction_code;

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
        var hits = correctTypes.filter((value) => cardTypes.includes(value));

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
        var targetCostType = ""; // 'cost', 'advancement_cost' or null
        if (correctCard.value.cost !== undefined) {
            targetCostType = "cost";
        } else if (correctCard.value.advancement_cost !== undefined) {
            targetCostType = "advancement_cost";
        } else {
            targetCostType = null; // Identities
        }

        var guessedCostType = ""; // 'cost', 'advancement_cost' or null
        if (card.cost !== undefined) {
            guessedCostType = "cost";
        } else if (card.advancement_cost !== undefined) {
            guessedCostType = "advancement_cost";
        } else {
            guessedCostType = null; // Identities
        }

        newGuess.checks.cost =
            correctCard.value[targetCostType] == card[guessedCostType];

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
        finished,
        // actions
        fetchPuzzle,
        initiateGuesses,
        startDailyPuzzle,
        startPracticePuzzle,
        startSpecificPuzzle,
        guess,
    };
}