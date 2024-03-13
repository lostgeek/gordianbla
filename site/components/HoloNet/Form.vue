<script setup>
import { ref } from 'vue'

const emit = defineEmits(['enteredWord']);

const word = ref("");

function submit(e) {
    e.preventDefault();
    var sanitised = word.value;
    word.value = "";

    sanitised = sanitised.replace(/\s/g,'');
    if(sanitised != "")
        emit('enteredWord', sanitised);
}
</script>

<template>
    <form v-on:submit="submit">
        <input autofocus v-model="word" placeholder="intercept datastream" pattern="[^\s]+" title="Only single words" />
        <button type="submit">decypher</button>
    </form>
</template>

<style lang="scss" scoped>
form {
    margin-top:1rem;
    display:flex;
    justify-content: center;
    gap:.5rem;
    height: 2rem;
}

input,button {
    box-shadow: 0 0 10px rgba(var(--highlight-color-numbers), .3), 0 0 10px rgba(var(--highlight-color-numbers), .8);
    border:1px black solid;
    border-radius:.25rem;
    padding:.25rem;
    background: var(--background-color);
}
</style>
