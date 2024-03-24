<template>
  <Dialog
    v-model:visible="statisticsVisible" modal header="Statistics" :pt="{
      root: {
        style: 'overflow: clip; width: 30rem;',
      },
      mask: {
        style: 'backdrop-filter: blur(2px)',
      },
    }" :breakpoints="{ '320px': '100%' }"
  >
    <Statistics :format="format" />
    <Button
      v-if="prevFormat"
      class="p-button prev-button"
      :label="prevFormat.label"
      icon="fa-solid fa-arrow-left"
      rounded icon-pos="right" @click="switchFormat(prevFormat)"
    />
    <Button
      v-if="nextFormat"
      class="p-button next-button"
      :label="nextFormat.label"
      icon="fa-solid fa-arrow-right"
      rounded @click="switchFormat(nextFormat)"
    />
    <template #footer>
      <div class="footer">
        <div class="next">
          Next puzzle: <span class="time">{{ nextPuzzle }}</span>
        </div>
        <div v-if="gordian.solved.value" class="buttons">
          <Button icon="fa-solid fa-clipboard" label="Copy result" @click="copyResult()" />
          <div>
            <Checkbox
              v-model="user.exportSettings.discordSpoiler" :binary="true" input-id="discordSpoiler"
              name="discordSpoiler"
            />
            <label for="discordSpoiler"> Discord spoiler </label>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
const props = defineProps(['format', 'gordian'])

const user = useUser()

const toast = useToast()

const statisticsVisible = useState('statisticsVisible', () => false)

const formatLabel = {
  eternal: 'Eternal',
  standard: 'Standard',
  neo: 'Neo (All-NSG)',
  startup: 'Startup',
}

const currentFormatIndex = Object.keys(formatLabel).findIndex(x => x === props.format)
const prevFormat = ref(null)
const nextFormat = ref(null)
if (currentFormatIndex > 0) {
  const id = Object.keys(formatLabel)[currentFormatIndex - 1]
  prevFormat.value = {
    id,
    label: formatLabel[id],
    to: `/daily/${id}`,
  }
}
if (currentFormatIndex < Object.keys(formatLabel).length - 1) {
  const id = Object.keys(formatLabel)[currentFormatIndex + 1]
  nextFormat.value = {
    id,
    label: formatLabel[id],
    to: `/daily/${id}`,
  }
}

async function switchFormat(format) {
  await navigateTo(format.to)
  statisticsVisible.value = false
}

const nextPuzzle = ref('')
setInterval(() => {
  const now = new Date()
  const nextPuzzleDate = new Date()
  nextPuzzleDate.setUTCDate(nextPuzzleDate.getUTCDate() + 1)
  nextPuzzleDate.setUTCHours(0)
  nextPuzzleDate.setUTCMinutes(0)
  nextPuzzleDate.setUTCSeconds(0)
  nextPuzzleDate.setUTCMilliseconds(0)
  const diff = nextPuzzleDate - now
  let tmp = Math.floor(diff / (1000 * 60 * 60))
  tmp += `:${String(Math.floor(diff / (1000 * 60) % 60)).padStart(2, '0')}`
  tmp += `:${String(Math.floor(diff / 1000 % 60)).padStart(2, '0')}`
  nextPuzzle.value = tmp
}, 1000)

function copyResult() {
  let text = ''
  text = `gordianbla.de - ${formatLabel[props.format]} - ${props.gordian.puzzleAttr.value.dailyNumber}\n`
  text += `Guesses: ${props.gordian.currentGuess.value}/6\n`

  for (const g of props.gordian.guesses.value) {
    if (g.state !== 'not-guessed') {
      if (g.checks.faction) {
        text += '🟩'
      } else {
        if (user.lightMode)
          text += '⬜'
        else text += '⬛'
      }

      if (g.checks.type) {
        text += '🟩'
      } else {
        if (user.lightMode)
          text += '⬜'
        else
          text += '⬛'
      }

      if (g.checks.subtype.total === 0) {
        if (g.checks.subtype.class === 'correct') {
          text += '🟩'
        } else {
          if (user.lightMode)
            text += '⬜'
          else
            text += '⬛'
        }
      } else {
        if (g.checks.subtype.hits === g.checks.subtype.total) {
          text += '🟩'
        } else {
          if (user.lightMode)
            text += '⬜'
          else
            text += '⬛'
        }
      }
      if (g.checks.cost) {
        text += '🟩'
      } else {
        if (user.lightMode)
          text += '⬜'
        else
          text += '⬛'
      }

      if (g.checks.title) {
        text += '🟩'
      } else {
        if (user.lightMode)
          text += '⬜'
        else
          text += '⬛'
      }

      if (user.exportSettings.discordSpoiler) {
        const maxLen = 40
        const paddedText = g.guessedTitle
          .padStart(Math.floor((g.guessedTitle.length + maxLen) / 2))
          .padEnd(maxLen)
        text += `||\`${paddedText}\`||`
      }
      text += '\n'
    }
  }
  navigator.clipboard.writeText(text.trim())
  toast.add({ severity: 'info', summary: 'Sharing results', detail: 'Text copied to clipboard.', life: 3000 })
}
</script>

<style lang="scss" scoped>
.prev-button, .next-button {
    position: absolute;
    top:50%;
    transition: transform .3s ease-in-out;
}
.next-button {
    right: 0;
    transform: translateX(calc(100% - 2rem));

    & :deep(.p-button-label) {
        padding-right: 2rem;
    }

    &:hover {
    transform: translateX(2rem);
    }
}

.prev-button {
    left: 0;
    transform: translateX(calc(-100% + 2rem));

    & :deep(.p-button-label) {
        padding-left: 2rem;
    }

    &:hover {
    transform: translateX(-2rem);
    }
}
.footer {
    display: flex;
    justify-content: space-between;
    align-items: last baseline;
    width: 100%;

    & .next {
        font-family: 'Patua One';
        font-size: 1.2rem;

        & .time {
            font-size: 1.4rem;
        }
    }

    .buttons {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: .5rem;
    }
}
</style>
