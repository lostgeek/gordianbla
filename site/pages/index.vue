<template>
    <div class="main">
        <div class="left">
            <GuessTable :guesses="gordian.guesses.value" />
            <CardInputField v-if="!gordian.solved.value" :cards="nrdb.cards" @submit="(card) => gordian.guess(card)" />
        </div>
        <div class="right">
            <Puzzle :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
        </div>
    </div>
    <StatisticsDialog :gordian="gordian" />
</template>

<script setup>
const data = await $fetch('/api/current_daily_puzzle');
const currentDaily = data.daily;

const nrdb = useNrdb();
await callOnce(nrdb.fetch);

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
cardSvg.value = await gordian.startPuzzle(nrdb.cards, currentDaily, user.dailyHistory[currentDaily]);
const cardUrl = computed(() => nrdb.imageUrlTemplate.replace('{code}', gordian.correctCard.value.code));
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