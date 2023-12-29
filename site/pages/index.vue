<template>
    <h1>Hello World!</h1>
    <p>
        gordian: {{ gordian.guesses }}
    </p>
    <input type="text" v-model="cardtitle" />
    <button @click="guess">Submit</button>
</template>

<script setup>
const nrdb = useNrdb();
await callOnce(nrdb.fetch);

const gordian = useGordian();
await gordian.startPuzzle(30);

const cardtitle = ref("");

async function guess() {
    await gordian.guess(cardtitle.value);
}
</script>