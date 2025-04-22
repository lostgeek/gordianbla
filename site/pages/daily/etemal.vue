<template>
  <Splitter :layout="getLayout">
    <SplitterPanel class="left" :size="75">
      <GuessTable :guesses="gordian.guesses.value" :spoiler="true" />
      <CardInputField :class="(gordian.finished.value) ? 'hidden' : null" :cards="cards" @submit="(card) => gordian.fakeGuess(card, target)" />
      <Transition name="fade">
        <NuxtLink v-if="revealLevel === 6" to="/" style="text-decoration: none; margin: 0 auto;">
          <Button
            label="Back to main page"
            icon="fa-solid fa-arrow-left"
            class="p-button-outlined"
          />
        </NuxtLink>
      </Transition>
    </SplitterPanel>
    <SplitterPanel class="right" :size="25">
      <Tag class="clickable" icon="fa-solid fa-calendar" @click="toggleFormatMenu">
        <template #default>
          <span>Format: {{ formatLabel[format] }}</span>
        </template>
      </Tag>
      <Menu
        id="format_overlay" ref="formatMenu" :model="formatMenuItems" :popup="true"
        :pt="{
          root: {
            style: 'min-width: 5rem;',
          },
          menu: {
            style: 'font-size: .75rem;',
          },
        }"
      >
        <template #item="{ item }">
          <NuxtLink v-if="item.route" v-ripple class="p-ripple p-menuitem-link" :to="item.route">
            <span class="p-menuitem-text">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </Menu>
      <template v-if="loaded">
        <div style="position: relative; width:100%; height:100%; aspect-ratio:63/88;">
          <Puzzle
            v-if="revealLevel < 6"
            :puzzle-mode="puzzleMode" :reveal-level="revealLevel" :card-url="cardUrl"
            :card-svg="cardSvg"
          />
          <div
            style="position: absolute!important;inset: 0;z-index: 60;"
          >
            <SpoilerPuzzle
              puzzle-mode="spoiler" :reveal-level="revealLevel" :card-url="spoilerUrl"
              :card-svg="spoilerSvg"
              style="position: absolute!important;top: 0"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <Skeleton class="puzzleSkeleton" width="100%" height="auto" />
      </template>
    </SplitterPanel>
  </Splitter>
  <RulesDialog />
</template>

<script setup>
const breakpoints = useBreakpoints({
  vert: 700,
})

const layoutBreakpoint = breakpoints.greater('vert')
const getLayout = computed(() => {
  if (layoutBreakpoint.value)
    return 'horizontal'
  else
    return 'vertical'
})

const loaded = useState('siteLoaded', () => false)
loaded.value = false

const format = ref('eternal')
const formatLabel = ref({
  eternal: 'Eternal',
  standard: 'Standard',
  neo: 'Neo (All-NSG)',
  startup: 'Startup',
})
const formatMenu = ref()
function toggleFormatMenu(event) {
  formatMenu.value.toggle(event)
}
const formatMenuItems = ref([
  {
    label: 'Eternal',
    route: '/daily/eternal',
  },
  {
    label: 'Standard',
    route: '/daily/standard',
  },
  {
    label: 'Neo (All-NSG)',
    route: '/daily/neo',
  },
  {
    label: 'Startup',
    route: '/daily/startup',
  },
])
useSeoMeta({
  title: `Gordian Blade - ${formatLabel.value[format.value]}`,
  ogTitle: `Gordian Blade - ${formatLabel.value[format.value]}`,
  description: 'The daily Netrunner puzzle!',
  ogDescription: 'The daily Netrunner puzzle!',
  ogImage: 'https://gordianbla.de/android-chrome-192x192.png',
  twitterCard: 'summary_large_image',
})

// Dialogs
const nrdb = useNrdb()
const cards = computed(() => {
  return nrdb.cards
})
try {
  await nrdb.fetch()
} catch ({ name, message }) {
  toast.add({
    severity: 'error',
    summary: name,
    detail: message,
  })
}

const gordian = useGordian()

const target = computed(() => ({
  ...nrdb.cards.find(c => c.code === '01070'),
  stripped_title: 'Byte!',
}))

const revealLevel = computed(() => {
  if (gordian.finished.value)
    return 6
  else
    return gordian.currentGuess.value
})
const puzzleMode = computed(() => gordian.puzzleAttr.value.mode)
const cardSvg = ref(null)
const cardUrl = computed(() => nrdb.imageUrlTemplate.replace('{code}', gordian.puzzleAttr.value.nrdbID))
const spoilerUrl = ref('/SPOILER.png')
const spoilerSvg = ref()

onMounted(async () => {
  cardSvg.value = await gordian.startSpecificPuzzle(nrdb.cards, 'sg', '30070', '00')
  spoilerSvg.value = await gordian.startSpecificPuzzle(nrdb.cards, 'daw', '40000', '00')
  loaded.value = true
})

const user = useUser()
watch(gordian.finished, (newValue) => {
  if (!newValue)
    return
  user.spoilerData.years.push(2025)
})
</script>

<style lang="scss" scoped>
:deep(.left) {
    padding: 1rem;
    display: flex;
    flex-direction: column;

    gap: 1rem;
}

:deep(.right) {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 1rem;
    gap: 1rem;
    @media(max-width:1000px) {
        padding: .5rem;
        gap: .5rem;
    }
    @media(max-width:400px) {
        padding: .25rem;
        gap: .25rem;
    }

    &>* {
        flex-grow: 0;
    }

    & .sliderGroup {
        align-self: stretch;
    }

    @media(max-width:400px) {
        min-width: 0;
        width: 100%;
    }
}

.puzzleSkeleton {
    width: 100%;
    border-radius: 4.7% / 3.6%;
    aspect-ratio: 63.5/88;
}

.hidden {
    visibility: hidden;
}

.clickable {
    cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
  transition-delay: 2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
