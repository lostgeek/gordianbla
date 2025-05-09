export const useUser = defineStore(
  'userStore',
  () => {
    const lightMode = ref(false)
    const squintMode = ref(false)
    const newestArticleViewed = ref(0)
    const exportSettings = ref({ discordSpoiler: false })
    const spoilerData = ref({
      years: [],
    })

    // Eternal daily
    const dailyHistory = ref({})

    const importedStats = ref({
      played: 0,
      wins: 0,
      streak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0],
    })
    const offsetStats = ref({
      played: 0,
      wins: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0],
    })

    const stats = computed(() => {
      // remove all proxies from importedStats
      const res = { ...importedStats.value }
      res.distribution = [...importedStats.value.distribution]

      // Apply offset stats
      res.played += offsetStats.value.played
      res.wins += offsetStats.value.played
      // Max streak offset is applied after calculations

      for (let i = 0; i < res.distribution.length; i++)
        res.distribution[i] += offsetStats.value.distribution[i]

      // Apply dailyHistory
      res.played += Object.values(dailyHistory.value).filter(
        g => g.findIndex(x => x.state === 'guessed') >= 0,
      ).length
      res.wins += Object.values(dailyHistory.value).filter(
        g => g.findIndex(x => x.checks && x.checks.title) >= 0,
      ).length

      const maxDaily = Math.max.apply(
        null,
        Object.keys(dailyHistory.value),
      )

      let streak = 0
      for (let i = maxDaily; i >= 0; i--) {
        if (
          i in dailyHistory.value
          && dailyHistory.value[i].findIndex(
            x => x.checks && x.checks.title,
          ) >= 0
        ) {
          streak++
        } else {
          break
        }
      }
      res.streak = streak

      let maxStreak = 0
      let currStreak = 0
      for (let i = 0; i >= 0; i--) {
        if (
          i in dailyHistory.value
          && dailyHistory.value[i].findIndex(
            x => x.checks && x.checks.title,
          ) >= 0
        ) {
          currStreak++
        } else {
          if (currStreak > maxStreak) {
            maxStreak = currStreak
            currStreak = 0
          }
        }
      }
      if (currStreak > maxStreak)
        maxStreak = currStreak

      res.maxStreak = Math.max(res.maxStreak, maxStreak)
      res.maxStreak += offsetStats.value.maxStreak // Apply offset on the determined maxStreak

      Object.values(dailyHistory.value).forEach((g) => {
        const usedGuesses = g.findIndex(
          x => x.checks && x.checks.title,
        )
        if (usedGuesses > -1)
          res.distribution[usedGuesses]++
      })

      return res
    })

    function importOldStats() {
      // already imported
      if (importedStats.value.played !== 0)
        return false

      // no old stats
      if (
        !(
          localStorage.getItem('played')
          && localStorage.getItem('wins')
          && localStorage.getItem('maxStreak')
          && localStorage.getItem('distribution')
        )
      ) {
        return false
      }

      // No games played in imported stats
      if (Number.parseInt(localStorage.getItem('played')) === 0)
        return false

      importedStats.value.played = Number.parseInt(
        localStorage.getItem('played'),
      )
      importedStats.value.wins = Number.parseInt(localStorage.getItem('wins'))
      importedStats.value.maxStreak = Number.parseInt(
        localStorage.getItem('maxStreak'),
      )
      importedStats.value.distribution = localStorage
        .getItem('distribution')
        .split('-')
        .map(x => Number.parseInt(x))

      return true
    }

    // Other formats daily
    const dailyStandardHistory = ref({})
    const dailyNeoHistory = ref({})
    const dailyStartupHistory = ref({})

    function createFormatStats(format) {
      const res = {
        played: 0,
        wins: 0,
        streak: 0,
        maxStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0],
      }
      let history
      if (format === 'standard')
        history = dailyStandardHistory.value
      else if (format === 'neo')
        history = dailyNeoHistory.value
      else if (format === 'startup')
        history = dailyStartupHistory.value
      else
        return null

      // Apply dailyHistory
      res.played += Object.values(history).filter(
        g => g.findIndex(x => x.state === 'guessed') >= 0,
      ).length
      res.wins += Object.values(history).filter(
        g => g.findIndex(x => x.checks && x.checks.title) >= 0,
      ).length

      const maxDaily = Math.max.apply(null, Object.keys(history))

      let streak = 0
      for (let i = maxDaily; i >= 0; i--) {
        if (
          i in history
          && history[i].findIndex(x => x.checks && x.checks.title) >= 0
        ) {
          streak++
        } else {
          break
        }
      }
      res.streak = streak

      let maxStreak = 0
      let currStreak = 0
      for (let i = 0; i >= 0; i--) {
        if (
          i in history
          && history[i].findIndex(x => x.checks && x.checks.title) >= 0
        ) {
          currStreak++
        } else {
          if (currStreak > maxStreak) {
            maxStreak = currStreak
            currStreak = 0
          }
        }
      }
      if (currStreak > maxStreak)
        maxStreak = currStreak

      res.maxStreak = maxStreak

      Object.values(history).forEach((g) => {
        const usedGuesses = g.findIndex(
          x => x.checks && x.checks.title,
        )
        if (usedGuesses > -1)
          res.distribution[usedGuesses]++
      })

      return res
    }

    const standardStats = computed(() => createFormatStats('standard'))
    const neoStats = computed(() => createFormatStats('neo'))
    const startupStats = computed(() => createFormatStats('startup'))

    const playedAnyGame = computed(() => {
      return (
        stats.value.played > 0
        || standardStats.value.played > 0
        || neoStats.value.played > 0
        || startupStats.value.played > 0
      )
    })

    // Server export
    const accountInfo = ref(null)
    async function createUser() {
      await $fetch('/api/users', {
        method: 'POST',
        body: {
          dailyHistory: dailyHistory.value,
          importedStats: importedStats.value,
          offsetStats: offsetStats.value,
          dailyStandardHistory: dailyStandardHistory.value,
          dailyNeoHistory: dailyNeoHistory.value,
          dailyStartupHistory: dailyStartupHistory.value,
        },
        timeout: 3000,
      }).catch((e) => {
        throw e
      }).then((res) => {
        accountInfo.value = {
          _id: res._id,
          secret: res.secret,
        }
      })
    }

    function mergeUserData(data, overwrite = false) {
      accountInfo.value = {
        _id: data._id,
        secret: data.secret,
      }
      if (overwrite) {
        dailyHistory.value = data.dailyHistory
        importedStats.value = data.importedStats
        offsetStats.value = data.offsetStats
        dailyStandardHistory.value = data.dailyStandardHistory
        dailyNeoHistory.value = data.dailyNeoHistory
        dailyStartupHistory.value = data.dailyStartupHistory
      } else {
        dailyHistory.value = { ...dailyHistory.value, ...data.dailyHistory }
        importedStats.value = { ...importedStats.value, ...data.importedStats }
        offsetStats.value = { ...offsetStats.value, ...data.offsetStats }
        dailyStandardHistory.value = { ...dailyStandardHistory.value, ...data.dailyStandardHistory }
        dailyNeoHistory.value = { ...dailyNeoHistory.value, ...data.dailyNeoHistory }
        dailyStartupHistory.value = { ...dailyStartupHistory.value, ...data.dailyStartupHistory }
      }
    }

    async function fetchUser(overwrite = false) {
      if (!accountInfo.value)
        return

      const userId = accountInfo.value._id

      const data = await $fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: accountInfo.value.secret,
        },
        timeout: 3000,
      })

      mergeUserData(data, overwrite)
    }

    async function updateUser(fields) {
      if (!accountInfo.value)
        return

      const update = {}
      if (fields.includes('dailyHistory'))
        update.dailyHistory = dailyHistory.value

      if (fields.includes('importedStats'))
        update.importedStats = importedStats.value

      if (fields.includes('offsetStats'))
        update.offsetStats = offsetStats.value

      if (fields.includes('dailyStandardHistory'))
        update.dailyStandardHistory = dailyStandardHistory.value

      if (fields.includes('dailyNeoHistory'))
        update.dailyNeoHistory = dailyNeoHistory.value

      if (fields.includes('dailyStartupHistory'))
        update.dailyStartupHistory = dailyStartupHistory.value

      await $fetch(`/api/users/${accountInfo.value._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: accountInfo.value.secret,
        },
        body: update,
        timeout: 3000,
      })
    }

    async function createInvite() {
      if (!accountInfo.value)
        return

      const userId = accountInfo.value._id

      const invite = await $fetch(`/api/users/${userId}/invites`, {
        method: 'POST',
        headers: {
          Authorization: accountInfo.value.secret,
        },
        timeout: 3000,
      })
      invite.expiration = new Date(invite.expiration)
      return invite
    }

    async function fetchUserFromInvite(link) {
      const user = await $fetch(`/api/invites/${link}/users`, {
        method: 'GET',
        timeout: 3000,
      })

      mergeUserData(user, true)
    }

    return {
      // state
      dailyHistory,
      dailyStandardHistory,
      dailyNeoHistory,
      dailyStartupHistory,
      lightMode,
      squintMode,
      importedStats,
      offsetStats,
      newestArticleViewed,
      exportSettings,
      accountInfo,
      spoilerData,
      // getters
      stats,
      standardStats,
      neoStats,
      startupStats,
      playedAnyGame,
      // actions
      importOldStats,
      createUser,
      fetchUser,
      updateUser,
      createInvite,
      fetchUserFromInvite,
    }
  },
  { persist: { storage: localStorage } },
)
