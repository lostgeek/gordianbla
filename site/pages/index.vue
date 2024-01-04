<template>
    <div class="main">
        <div class="left">
            <GuessTable :guesses="gordian.guesses" />
            <CardInputField v-if="!gordian.solved" :nrdb="nrdb" :gordian="gordian" />
        </div>
        <div class="right">
            <Puzzle :gordian="gordian" :cardUrl="cardUrl" :cardSvg="cardSvg"/>
        </div>
    </div>
    <StatisticsDialog :gordian="gordian" :user="user" />
</template>

<script setup>
const data = await $fetch('/api/current_daily_puzzle');
const currentDaily = data.daily;

const nrdb = useNrdb();
await callOnce(nrdb.fetch);

const user = useUser();

const gordian = useGordian();

gordian.$subscribe((mutation, state) => {
    if(gordian.puzzleAttr.dailyNumber) {
        user.dailyHistory[gordian.puzzleAttr.dailyNumber] = state.guesses;
    }
})

const cardSvg = ref(null);
cardSvg.value = await gordian.startPuzzle(nrdb.cards, currentDaily, user.dailyHistory[currentDaily]);

const cardUrl = computed(() => nrdb.imageUrlTemplate.replace('{code}', gordian.correctCard.code));
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
}</style>