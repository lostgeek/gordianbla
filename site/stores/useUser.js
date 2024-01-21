export const useUser = defineStore(
    "userStore",
    () => {
        const lightMode = ref(false);
        const newestArticleViewed = ref(0);
        const exportSettings = ref({ discordSpoiler: false });

        // Eternal daily
        const dailyHistory = ref({});

        const importedStats = ref({
            played: 0,
            wins: 0,
            streak: 0,
            maxStreak: 0,
            distribution: [0, 0, 0, 0, 0, 0],
        });
        const offsetStats = ref({
            played: 0,
            wins: 0,
            maxStreak: 0,
            distribution: [0, 0, 0, 0, 0, 0],
        });

        const stats = computed(() => {
            // remove all proxies from importedStats
            var res = { ...importedStats.value };
            res.distribution = [...importedStats.value.distribution];

            // Apply offset stats
            res.played += offsetStats.value.played;
            res.wins += offsetStats.value.played;
            // Max streak offset is applied after calculations

            for (var i = 0; i < res.distribution.length; i++) {
                res.distribution[i] += offsetStats.value.distribution[i];
            }

            // Apply dailyHistory
            res.played += Object.values(dailyHistory.value).filter(
                (g) => g.findIndex((x) => x.state == "guessed") >= 0
            ).length;
            res.wins += Object.values(dailyHistory.value).filter(
                (g) => g.findIndex((x) => x.checks && x.checks.title) >= 0
            ).length;

            const maxDaily = Math.max.apply(
                null,
                Object.keys(dailyHistory.value)
            );

            var streak = 0;
            for (var i = maxDaily; i >= 0; i--) {
                if (
                    i in dailyHistory.value &&
                    dailyHistory.value[i].findIndex(
                        (x) => x.checks && x.checks.title
                    ) >= 0
                ) {
                    streak++;
                } else {
                    break;
                }
            }
            res.streak = streak;

            var maxStreak = 0;
            var currStreak = 0;
            for (var i = 0; i >= 0; i--) {
                if (
                    i in dailyHistory.value &&
                    dailyHistory.value[i].findIndex(
                        (x) => x.checks && x.checks.title
                    ) >= 0
                ) {
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
            res.maxStreak = Math.max(res.maxStreak, maxStreak);
            res.maxStreak += offsetStats.value.maxStreak; // Apply offset on the determined maxStreak

            Object.values(dailyHistory.value).forEach((g) => {
                var usedGuesses = g.findIndex(
                    (x) => x.checks && x.checks.title
                );
                if (usedGuesses > -1) {
                    res.distribution[usedGuesses]++;
                }
            });

            return res;
        });

        function importOldStats() {
            // already imported
            if (importedStats.value.played != 0) {
                return false;
            }
            // no old stats
            if (
                !(
                    localStorage.getItem("played") &&
                    localStorage.getItem("wins") &&
                    localStorage.getItem("maxStreak") &&
                    localStorage.getItem("distribution")
                )
            ) {
                return false;
            }

            // No games played in imported stats
            if (parseInt(localStorage.getItem("played")) == 0) {
                return false;
            }

            importedStats.value.played = parseInt(
                localStorage.getItem("played")
            );
            importedStats.value.wins = parseInt(localStorage.getItem("wins"));
            importedStats.value.maxStreak = parseInt(
                localStorage.getItem("maxStreak")
            );
            importedStats.value.distribution = localStorage
                .getItem("distribution")
                .split("-")
                .map((x) => parseInt(x));

            return true;
        }

        // Other formats daily
        const dailyStandardHistory = ref({});
        const dailyNeoHistory = ref({});
        const dailyStartupHistory = ref({});

        function createFormatStats(format) {
            var res = {
                played: 0,
                wins: 0,
                streak: 0,
                maxStreak: 0,
                distribution: [0, 0, 0, 0, 0, 0],
            };
            var history;
            if (format == "standard") {
                history = dailyStandardHistory.value;
            } else if (format == "neo") {
                history = dailyNeoHistory.value;
            } else if (format == "startup") {
                history = dailyStartupHistory.value;
            } else {
                return null;
            }

            // Apply dailyHistory
            res.played += Object.values(history).filter(
                (g) => g.findIndex((x) => x.state == "guessed") >= 0
            ).length;
            res.wins += Object.values(history).filter(
                (g) => g.findIndex((x) => x.checks && x.checks.title) >= 0
            ).length;

            const maxDaily = Math.max.apply(null, Object.keys(history));

            var streak = 0;
            for (var i = maxDaily; i >= 0; i--) {
                if (
                    i in history &&
                    history[i].findIndex((x) => x.checks && x.checks.title) >= 0
                ) {
                    streak++;
                } else {
                    break;
                }
            }
            res.streak = streak;

            var maxStreak = 0;
            var currStreak = 0;
            for (var i = 0; i >= 0; i--) {
                if (
                    i in history &&
                    history[i].findIndex((x) => x.checks && x.checks.title) >= 0
                ) {
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

            Object.values(history).forEach((g) => {
                var usedGuesses = g.findIndex(
                    (x) => x.checks && x.checks.title
                );
                if (usedGuesses > -1) {
                    res.distribution[usedGuesses]++;
                }
            });

            return res;
        }

        const standardStats = computed(() => createFormatStats("standard"));
        const neoStats = computed(() => createFormatStats("neo"));
        const startupStats = computed(() => createFormatStats("startup"));

        const playedAnyGame = computed(() => {
            return (
                stats.value.played > 0 ||
                standardStats.value.played > 0 ||
                neoStats.value.played > 0 ||
                startupStats.value.played > 0
            );
        });

        return {
            // state
            dailyHistory,
            dailyStandardHistory,
            dailyNeoHistory,
            dailyStartupHistory,
            lightMode,
            importedStats,
            offsetStats,
            newestArticleViewed,
            exportSettings,
            // getters
            stats,
            standardStats,
            neoStats,
            startupStats,
            playedAnyGame,
            // actions
            importOldStats,
        };
    },
    { persist: { storage: localStorage } }
);
