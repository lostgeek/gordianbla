<template>
    <div class="main">
        <div class="left">
            <GuessTable :guesses="gordian.guesses.value" />
            <CardInputField v-if="nrdb.cards.length > 0 && !gordian.solved.value" :cards="nrdb.cards" @submit="(card) => gordian.guess(card)" />
        </div>
        <div class="right">
            <Puzzle v-if="cardSvg" :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
        </div>
    </div>
    <StatisticsDialog :gordian="gordian" />
    <RulesDialog v-if="nrdb.cards.length > 0" :cards="nrdb.cards" :imageUrlTemplate="nrdb.imageUrlTemplate" />
</template>

<script setup>
const data = await $fetch('/api/current_daily_puzzle');
const currentDaily = data.daily;

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
    try {
        await callOnce(nrdb.fetch);
    } catch ({name, message}) {
        console.log(name, message);
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }

    cardSvg.value = await gordian.startDailyPuzzle(nrdb.cards, currentDaily, user.dailyHistory[currentDaily]);

    // Show rules dialog if user has not played a daily yet,
    // i.e. only today's entry in history and current revealLevel is 0.
    if(Object.keys(user.dailyHistory).length == 1 && revealLevel.value == 0) {
        setTimeout(() => {
            rulesVisible.value = true;
        }, 1000);
    }
});

</script>

<style lang="scss">
.main {
    display: flex;
    flex-wrap: wrap;
    margin: 0 1rem;
    gap: 1rem;

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
    flex-grow: 3;

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
    flex-grow: 1;
}
</style>