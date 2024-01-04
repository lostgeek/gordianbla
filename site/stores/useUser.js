export const useUser = defineStore("userStore", () => {
  const dailyHistory = ref({});

  const stats = computed(() => {
    var res = { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: [0,10,20,30,40,50]};

    res.played = Object.values(dailyHistory.value).filter(g => (g.findIndex((x) => x.state == 'guessed')>=0)).length;
    res.wins = Object.values(dailyHistory.value).filter(g => (g.findIndex((x) => x.checks && x.checks.title)>=0)).length;

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
    res.maxStreak = maxStreak;

    var distribution = [0, 0, 0, 0, 0, 0];
    Object.values(dailyHistory.value).forEach(g => {
      var usedGuesses = g.findIndex((x) => x.checks && x.checks.title);
      if(usedGuesses > -1) {
        distribution[usedGuesses]++;
      }
    });
    res.distribution = distribution;

    return res;
  }
  );

  return {
    // state
    dailyHistory,
    // getters
    stats,
  };
}, {persist: {storage: localStorage}});