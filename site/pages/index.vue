<template>
    <div class="main">
        <div class="left">
            <GuessTable :guesses="gordian.guesses" />
            <CardInputField v-if="!gordian.solved" :nrdb="nrdb" :gordian="gordian" />
        </div>
        <div class="right">
            <Puzzle :gordian="gordian" :nrdb="nrdb" />
        </div>
    </div>
    <StatisticsDialog :gordian="gordian" />
</template>

<script setup>
const nrdb = useNrdb();
await callOnce(nrdb.fetch);

const gordian = useGordian();
await gordian.startPuzzle(113);
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