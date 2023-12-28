<template>
    <h1>Hello World!</h1>
    <p>
        imageUrlTemplate: {{ nrdb.imageUrlTemplate }}
    </p>
    <p>
        cards: {{ nrdb.cards }}
    </p>
</template>

<script setup>
const nrdb = useNrdb();
await callOnce(nrdb.fetch);
</script>