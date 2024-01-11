<template>
    <div v-if="loaded">
        <div class="main">
            <div class="left">
                <GuessTable :guesses="gordian.guesses.value" />
                <CardInputField v-if="!gordian.solved.value" :cards="nrdb.cards" @submit="(card) => gordian.guess(card)" />
            </div>
            <div class="right">
                <Puzzle v-if="cardSvg" :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
            </div>
        </div>
        <StatisticsDialog :gordian="gordian" />
        <RulesDialog :cards="nrdb.cards" :imageUrlTemplate="nrdb.imageUrlTemplate" />
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
const loaded = useState('siteLoaded', () => false);

const data = await $fetch('/api/current_daily_puzzle');
const currentDaily = data.daily-3;

// Dialogs
const statisticsVisible = useState('statisticsVisible', () => false);
const rulesVisible = useState('rulesVisible', () => false);

const toast = useToast();

const nrdb = useNrdb();

const user = useUser();

const gordian = useGordian();

watch(gordian.guesses, (oldGuesses, newGuesses) => {
    if (gordian.puzzleAttr.value.dailyNumber) {
        user.dailyHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
    }

    if (gordian.solved.value) {
        setTimeout(() => {
            statisticsVisible.value = true;
        }, 2500);
    }
});

const revealLevel = computed(() => {
    if(gordian.solved.value) {
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
            severity: 'info',
            summary: "Import old stats",
            detail: "Old stats found and successfully imported."
        });
    }

    try {
        await callOnce(nrdb.fetch);

        cardSvg.value = await gordian.startDailyPuzzle(nrdb.cards, currentDaily, user.dailyHistory[currentDaily]);

        // Show rules dialog if user has not played a daily yet
        if(user.stats.played == 0 && revealLevel.value == 0) {
            setTimeout(() => {
                rulesVisible.value = true;
            }, 1000);
        }

        loaded.value = true;
    } catch ({name, message}) {
        console.log(name, message);
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