<script setup>
import { ref, watch } from 'vue'
import Image from './Image.vue'
import Form from './Form.vue'
import History from './History.vue'
import Toast from './Toast.vue'

const imageWord = ref("");
const historyHits = ref([]);

function checkWord(word) {
    imageWord.value = word;
}

function addHistory(word, hits, percentage) {
    historyHits.value = [word, hits, percentage];
}

const revealed = ref(false);

function reveal(status) {
    revealed.value = status;
}

const toastMessage = ref({});
function showToast(message) {
   toastMessage.value = message;
}
    
</script>

<template>
    <div class="puzzle">
        <div class="left">
            <Image :word="imageWord" @hits="(w,h,p) => addHistory(w,h,p)" :revealed="revealed"></Image>
            <Form @entered-word="(w) => checkWord(w)" v-show="!revealed"></Form>
        </div>
        <div class="right">
            <History :hits="historyHits" @reveal="(status) => reveal(status)" @toast="(message) => showToast(message)"></History>
        </div>
    </div>
    <Toast :message="toastMessage"></Toast>
</template>

<style lang="scss" scoped>
.puzzle {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    align-content: flex-start;
    max-width: 70rem;
    width:80vw;
    @media (max-width: 70rem) {
        gap: 1rem;
    }
}

.left,.right {
    max-height: 80vh;
    display: flex;
    height:fit-content;
}

.left {
    flex-direction: column;
    align-items: center;
    flex-grow: 3;
}
.right {
    flex-direction: row;
    justify-content: center;

    min-width:20rem;
    max-width:30rem;
    width:30vw;
    @media (max-width: 70rem) {
        width:100%;
    }
}

</style>
