export const useUser = defineStore("userStore", () => {
  const dailyHistory = ref({});
  const lightMode = ref(false);

  const importedStats = ref({ played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: [0,0,0,0,0,0]});
  const offsetStats = ref({ played: 0, wins: 0, maxStreak: 0, distribution: [0,0,0,0,0,0]});

  const stats = computed(() => {
    // remove all proxies from importedStats
    var res = {... importedStats.value};
    res.distribution = [... importedStats.value.distribution];

    // Apply offset stats
    res.played += offsetStats.value.played;
    res.wins += offsetStats.value.played;
    res.maxStreak = Math.max(res.maxStreak, offsetStats.value.maxStreak);
    for (var i = 0; i < res.distribution.length; i++) {
      res.distribution[i] += offsetStats.value.distribution[i];
    }

    // Apply dailyHistory
    res.played += Object.values(dailyHistory.value).filter(g => (g.findIndex((x) => x.state == 'guessed')>=0)).length;
    res.wins += Object.values(dailyHistory.value).filter(g => (g.findIndex((x) => x.checks && x.checks.title)>=0)).length;

    const maxDaily = Math.max.apply(null, Object.keys(dailyHistory.value));

    var streak = 0;
    for(var i = maxDaily; i >= 0; i--) {
      if (i in dailyHistory.value && dailyHistory.value[i].findIndex((x) => x.checks && x.checks.title)>=0) {
        streak++;
      } else {
        break;
      }
    }
    res.streak = streak;

    var maxStreak = 0;
    var currStreak = 0;
    for(var i = 0; i >= 0; i--) {
      if (i in dailyHistory.value && dailyHistory.value[i].findIndex((x) => x.checks && x.checks.title)>=0) {
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

    Object.values(dailyHistory.value).forEach(g => {
      var usedGuesses = g.findIndex((x) => x.checks && x.checks.title);
      if(usedGuesses > -1) {
        res.distribution[usedGuesses]++;
      }
    });

    return res;
  }
  );

  function importOldStats() {
    // already imported
    if (importedStats.value.played != 0) {
      return false;
    }
    // no old stats
    if (! (localStorage.getItem('played') &&localStorage.getItem('wins') && localStorage.getItem('maxStreak') && localStorage.getItem('distribution'))) {
      return false;
    }

    importedStats.value.played = parseInt(localStorage.getItem('played'));
    importedStats.value.wins = parseInt(localStorage.getItem('wins'));
    importedStats.value.maxStreak = parseInt(localStorage.getItem('maxStreak'));
    importedStats.value.distribution = localStorage.getItem('distribution').split('-').map(x => parseInt(x));

    return true;
  }

  return {
    // state
    dailyHistory,
    lightMode,
    importedStats,
    offsetStats,
    // getters
    stats,
    // actions
    importOldStats,
  };
}, {persist: {storage: localStorage}});