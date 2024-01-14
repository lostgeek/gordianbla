<template>
    <div v-if="loaded">
        <div class="main">
            <div class="left">
                <GuessTable :guesses="gordian.guesses.value" />
                <CardInputField v-if="!gordian.finished.value" :cards="cards" @submit="(card) => gordian.guess(card)" />
            </div>
            <div class="right">
                <Puzzle v-if="cardSvg" :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
            </div>
        </div>
        <StatisticsDialog :format="format" :gordian="gordian" />
        <RulesDialog :cards="cards" :imageUrlTemplate="nrdb.imageUrlTemplate" />
    </div>
    <div v-else>
        <div class="main">
            <div class="left">
                <GuessTable :guesses='[{state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }]' />
                <Skeleton width="100%" height="3rem" />
            </div>
            <div class="right">
                <Skeleton class="puzzleSkeleton" width="100%" height="auto"/>
            </div>
        </div>
    </div>
</template>

<script setup>
const route = useRoute();
const loaded = useState('siteLoaded', () => false);
if(!['eternal', 'standard', 'neo', 'startup'].includes(route.params.format)) {
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
        } else if(format.value == 'standard') {
            user.dailyStandardHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
        } else if(format.value == 'neo') {
            user.dailyNeoHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
        } else if(format.value == 'startup') {
            user.dailyStartupHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
        }
    }

    if (gordian.finished.value) {
        // Analytics
        if(oldG.length > 0) { // If this is not the page loading to a finished puzzle
            useTrackEvent('solve_daily', {props: {format: format.value}});
        }

        setTimeout(() => {
            statisticsVisible.value = true;
        }, 2500);
    }
}, {deep: true});

const revealLevel = computed(() => {
    if(gordian.finished.value) {
        return 6;
    } else {
        return gordian.currentGuess.value;
    }
});
const puzzleMode = computed(() => gordian.puzzleAttr.value.mode);
const cardSvg = ref(null);
const cardUrl = computed(() => nrdb.imageUrlTemplate.replace('{code}', gordian.puzzleAttr.value.nrdbID));

onMounted(async () => {
    if(user.importOldStats()) {
        toast.add({
            severity: 'success',
            summary: "Import old stats",
            detail: "Old stats found and imported. Welcome to the new Gordian Blade!"
        });
    }

    try {
        await callOnce(nrdb.fetch);

        var history;
        if(format.value == 'eternal') {
            history = user.dailyHistory[currentDaily];
        } else if(format.value == 'standard') {
            history = user.dailyStandardHistory[currentDaily];
        } else if(format.value == 'neo') {
            history = user.dailyNeoHistory[currentDaily];
        } else if(format.value == 'startup') {
            history = user.dailyStartupHistory[currentDaily];
        }
        cardSvg.value = await gordian.startDailyPuzzle(cards.value, currentDaily, format.value, history);

        // Show rules dialog if user has not played a daily yet
        if(user.stats.played == 0 && revealLevel.value == 0) {
            setTimeout(() => {
                rulesVisible.value = true;
            }, 1000);
        }

        loaded.value = true;
    } catch ({name, message}) {
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }
});

</script>

<style lang="scss" scoped>
.main {
    display: flex;
    flex-wrap: wrap;
    margin: 0 1rem;
    gap: 1rem;
    justify-content: center;

    @media(max-width:1000px) {
        margin: 0 .5rem;
        gap: .5rem;
    }

    @media(max-width:400px) {
        margin: 0 .25rem;
        gap: .25rem;
    }
}

.left {
    flex-grow: 2;

    display: flex;
    flex-direction: column;

    gap: 1rem;

    @media(max-width:1000px) {
        gap: .5rem;
    }

    @media(max-width:400px) {
        gap: .25rem;
    }
}

.right {
    flex-grow: 5;

    min-width: 15rem;
    max-width: 26rem;

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