<template>
    <Splitter :layout="getLayout">
        <SplitterPanel :size="75">
            <div class="left" v-if="loaded">
                <GuessTable :guesses="gordian.guesses.value" />
                <CardInputField v-if="!gordian.finished.value" :cards="cards" @submit="(card) => gordian.guess(card)" />
            </div>
            <div class="left" v-else>
                <GuessTable
                    :guesses='[{ state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }]' />
                <Skeleton width="100%" height="3rem" />
            </div>
        </SplitterPanel>
        <SplitterPanel class="right" :size="25">
            <div v-if="loaded">
                <Puzzle v-if="cardSvg" :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl"
                    :cardSvg="cardSvg" />
            </div>
            <div v-else>
                <Skeleton class="puzzleSkeleton" width="100%" height="auto" />
            </div>
        </SplitterPanel>
    </Splitter>
    <StatisticsDialog :format="format" :gordian="gordian" />
    <RulesDialog />
</template>

<script setup>
const breakpoints = useBreakpoints({
    vert: 700,
})

const layoutBreakpoint = breakpoints.greater('vert');
const getLayout = computed(() => {
    if (layoutBreakpoint.value) {
        return 'horizontal';
    } else {
        return 'vertical';
    }
});

const route = useRoute();
const loaded = useState('siteLoaded', () => false);
if (!['eternal', 'standard', 'neo', 'startup'].includes(route.params.format)) {
    navigateTo('/daily/eternal');
}

const format = computed(() => route.params.format);

const data = await $fetch(`/api/current_daily_puzzle?format=${format.value}`);
const currentDaily = data.daily;

// Dialogs
const statisticsVisible = useState('statisticsVisible', () => false);
const rulesVisible = useState('rulesVisible', () => false);

const toast = useToast();

const nrdb = useNrdb();
const cards = computed(() => {
    if (format.value == 'eternal') {
        return nrdb.cards;
    } else {
        return nrdb.cards.filter(c => nrdb.packsInFormat[format.value].map(f => f.code).includes(c.pack_code));
    }
});

const user = useUser();

const gordian = useGordian();

watch(gordian.guesses, (newG, oldG) => {
    if (gordian.puzzleAttr.value.dailyNumber) {
        if (format.value == 'eternal') {
            user.dailyHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
        } else if (format.value == 'standard') {
            user.dailyStandardHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
        } else if (format.value == 'neo') {
            user.dailyNeoHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
        } else if (format.value == 'startup') {
            user.dailyStartupHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
        }
    }

    if (gordian.finished.value) {
        if (oldG.length > 0) { // If this is not the page loading to a finished puzzle
            // Analytics
            useTrackEvent('solve_daily', { props: { format: format.value } });

            // Show statistics after 2.5s if still on the same page
            var formatBeforeTimeout = format.value;
            setTimeout(() => {
                var route = useRoute();
                if (route.path.startsWith(`/daily/${formatBeforeTimeout}`)) {
                    statisticsVisible.value = true;
                }
            }, 2500);
        }
    }
}, { deep: true });

const revealLevel = computed(() => {
    if (gordian.finished.value) {
        return 6;
    } else {
        return gordian.currentGuess.value;
    }
});
const puzzleMode = computed(() => gordian.puzzleAttr.value.mode);
const cardSvg = ref(null);
const cardUrl = computed(() => nrdb.imageUrlTemplate.replace('{code}', gordian.puzzleAttr.value.nrdbID));

onMounted(async () => {
    if (user.importOldStats()) {
        toast.add({
            severity: 'success',
            summary: "Import old stats",
            detail: "Old stats found and imported. Welcome to the new Gordian Blade!"
        });
    }

    try {
        await callOnce(nrdb.fetch);

        var history;
        if (format.value == 'eternal') {
            history = user.dailyHistory[currentDaily];
        } else if (format.value == 'standard') {
            history = user.dailyStandardHistory[currentDaily];
        } else if (format.value == 'neo') {
            history = user.dailyNeoHistory[currentDaily];
        } else if (format.value == 'startup') {
            history = user.dailyStartupHistory[currentDaily];
        }
        cardSvg.value = await gordian.startDailyPuzzle(cards.value, currentDaily, format.value, history);

        // Show rules dialog if user has not played a daily yet
        if (!user.playedAnyGame) {
            setTimeout(() => {
                rulesVisible.value = true;
            }, 1000);
        }

        loaded.value = true;
    } catch ({ name, message }) {
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }
});
</script>

<style lang="scss" scoped>
:deep(.left) {
    padding: 1rem;
    display: flex;
    flex-direction: column;

    gap: 1rem;
}

:deep(.right) {
    padding: 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;

    &>* {
        flex-grow: 0;
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
</style>