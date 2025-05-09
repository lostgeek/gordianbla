export function useGordian() {
  const puzzleAttr = ref({})
  const correctCard = ref(null)

  const guesses = ref([])

  async function fetchPuzzle(cards, url) {
    // Returns SVG of gordian puzzle

    const data = await $fetch(url)
    const cardSvg = await data.text()

    const lines = cardSvg.split('\n')
    const svgStart = lines.findIndex(l => l.startsWith('<svg'))
    const comment = lines.slice(0, svgStart)

    const metaData = {}
    comment.forEach((line) => {
      line = line.replace('<!--', '').replace('-->', '')
      const parts = line.split(': ')
      if (parts.length >= 2) {
        const key = parts.shift()
        const value = parts.join(': ')
        metaData[key] = value
      }
    })

    if (metaData.Title)
      puzzleAttr.value.title = metaData.Title
    else
      puzzleAttr.value.title = ''

    if (metaData['NRDB ID'])
      puzzleAttr.value.nrdbID = metaData['NRDB ID']
    else
      puzzleAttr.value.nrdbID = ''

    if (metaData.Mode)
      puzzleAttr.value.mode = metaData.Mode.split(' ')[1]
    else
      puzzleAttr.value.mode = ''

    if (metaData.n)
      puzzleAttr.value.maxElements = metaData.n
    else
      puzzleAttr.value.maxElements = 100

    if (metaData.additional)
      puzzleAttr.value.additional = metaData.additional.split(',')
    else
      puzzleAttr.value.additional = []

    if (metaData.daily)
      puzzleAttr.value.dailyNumber = Number.parseInt(metaData.daily)
    else
      puzzleAttr.value.dailyNumber = -1

    correctCard.value = cards.filter((c) => {
      return c.code === puzzleAttr.value.nrdbID
    })[0]

    return cardSvg
  }

  function initiateGuesses(initialGuesses = null) {
    if (initialGuesses) {
      guesses.value = initialGuesses
    } else {
      guesses.value = [
        { state: 'not-guessed' },
        { state: 'not-guessed' },
        { state: 'not-guessed' },
        { state: 'not-guessed' },
        { state: 'not-guessed' },
        { state: 'not-guessed' },
      ]
    }
  }

  async function startDailyPuzzle(
    cards,
    id,
    format = null,
    initialGuesses = null,
  ) {
    // Returns SVG of gordian puzzle

    let url = '/api/fetch_daily_puzzle'
    const params = []
    if (id > -1)
      params.push(`n=${id}`)

    if (format)
      params.push(`format=${format}`)

    if (params.length > 0)
      url += `?${params.join('&')}`

    const cardSvg = await fetchPuzzle(cards, url)

    initiateGuesses(initialGuesses)

    return cardSvg
  }

  async function startPracticePuzzle(cards, packs, initialGuesses = null) {
    // Returns SVG of gordian puzzle
    // packs: comma-separated pack codes

    let url
    if (packs)
      url = `/api/fetch_practice_puzzle?packs=${packs}`
    else
      url = '/api/fetch_practice_puzzle'

    const cardSvg = await fetchPuzzle(cards, url)

    initiateGuesses(initialGuesses)

    return cardSvg
  }

  async function startSpecificPuzzle(
    cards,
    pack,
    code,
    id,
    initialGuesses = null,
  ) {
    // Returns SVG of gordian puzzle
    // packs: comma-separated pack codes

    const url = `/api/fetch_puzzle?pack=${pack}&code=${code}&id=${id}`
    const cardSvg = await fetchPuzzle(cards, url)

    initiateGuesses(initialGuesses)

    return cardSvg
  }

  // Returns -1, if no guesses remaining
  // Returns null, if guesses not initialised
  const currentGuess = computed(() => {
    const result = guesses.value.findIndex(g => g.state === 'not-guessed')
    if (result >= 0)
      return result

    if (guesses.value.length === 0) {
      // Not initialised yet
      return null
    } else {
      // Final guess made
      return 6
    }
  })

  const solved = computed(() => {
    if (guesses.value.length === 0) {
      // guesses not yet initialised
      return false
    }

    return (
      guesses.value.findIndex(
        g => g.state === 'guessed' && g.checks.title === true,
      ) > -1
    )
  })

  const finished = computed(() => {
    return solved.value || currentGuess.value === 6
  })

  function fakeGuess(card, target) {
    const newGuess = {
      state: 'guessed',
      guessedTitle: currentGuess.value === 5 ? 'Byte!' : currentGuess.value === 4 ? 'You thought you were safe?' : card.title,
      checks: {},
    }

    /* Title */
    newGuess.checks.title
            = card.stripped_title === target.stripped_title || currentGuess.value === 5
    if (card.stripped_title === 'Snare!') {
      newGuess.guessedTitle = 'Snare?'
    }

    /* Faction */
    newGuess.checks.faction
            = card.faction_code === target.faction_code || currentGuess.value === 5

    /* Type */
    newGuess.checks.type = card.type_code === target.type_code || currentGuess.value === 5

    /* Subtypes */
    let correctTypes = []
    if (target.keywords)
      correctTypes = target.keywords.split(' - ')

    let cardTypes = []
    if (card.keywords)
      cardTypes = card.keywords.split(' - ')

    // How many of the correct types are present on the guessed card?
    const hits = correctTypes.filter(value => cardTypes.includes(value))

    let subtypesClass = ''
    if (correctTypes.length === 0) {
      if (cardTypes.length === 0)
        subtypesClass = 'correct'
      else
        subtypesClass = 'incorrect'
    } else {
      subtypesClass = `partial-${hits.length}-${correctTypes.length}`
    }

    newGuess.checks.subtype = currentGuess.value === 5
      ? {
          hits: 1,
          total: 1,
          class: 'correct',
        }
      : {
          hits: hits.length,
          total: correctTypes.length,
          class: subtypesClass,
        }

    /* Cost */
    let targetCostType = '' // 'cost', 'advancement_cost' or null
    if (target.cost !== undefined)
      targetCostType = 'cost'
    else if (target.advancement_cost !== undefined)
      targetCostType = 'advancement_cost'
    else
      targetCostType = null // Identities

    let guessedCostType = '' // 'cost', 'advancement_cost' or null
    if (card.cost !== undefined)
      guessedCostType = 'cost'
    else if (card.advancement_cost !== undefined)
      guessedCostType = 'advancement_cost'
    else
      guessedCostType = null // Identities

    newGuess.checks.cost
            = target[targetCostType] === card[guessedCostType] || currentGuess.value === 5

    guesses.value[currentGuess.value] = newGuess
  }

  function guess(card) {
    if (currentGuess.value === -1 || solved.value || !correctCard.value)
      return

    const newGuess = {
      state: 'guessed',
      guessedTitle: card.title,
      checks: {},
    }

    /* Title */
    if (correctCard.pack_code === 'tdc') {
      // Filter TD alternate cards
      if (correctCard.pack_code === 'tdc') {
        const parts = correctCard.title.split(' ')
        correctCard.stripped_title = parts
          .filter(p => !['2', '3', '4', 'A', 'B'].includes(p))
          .join(' ')
      }
    }
    newGuess.checks.title
            = card.stripped_title === correctCard.value.stripped_title

    /* Faction */
    newGuess.checks.faction
            = card.faction_code === correctCard.value.faction_code

    /* Type */
    newGuess.checks.type = card.type_code === correctCard.value.type_code

    /* Subtypes */
    let correctTypes = []
    if (correctCard.value.keywords)
      correctTypes = correctCard.value.keywords.split(' - ')

    let cardTypes = []
    if (card.keywords)
      cardTypes = card.keywords.split(' - ')

    // How many of the correct types are present on the guessed card?
    const hits = correctTypes.filter(value => cardTypes.includes(value))

    let subtypesClass = ''
    if (correctTypes.length === 0) {
      if (cardTypes.length === 0)
        subtypesClass = 'correct'
      else
        subtypesClass = 'incorrect'
    } else {
      subtypesClass = `partial-${hits.length}-${correctTypes.length}`
    }

    newGuess.checks.subtype = {
      hits: hits.length,
      total: correctTypes.length,
      class: subtypesClass,
    }

    /* Cost */
    let targetCostType = '' // 'cost', 'advancement_cost' or null
    if (correctCard.value.cost !== undefined)
      targetCostType = 'cost'
    else if (correctCard.value.advancement_cost !== undefined)
      targetCostType = 'advancement_cost'
    else
      targetCostType = null // Identities

    let guessedCostType = '' // 'cost', 'advancement_cost' or null
    if (card.cost !== undefined)
      guessedCostType = 'cost'
    else if (card.advancement_cost !== undefined)
      guessedCostType = 'advancement_cost'
    else
      guessedCostType = null // Identities

    newGuess.checks.cost
            = correctCard.value[targetCostType] === card[guessedCostType]

    guesses.value[currentGuess.value] = newGuess
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
    fakeGuess,
  }
}
