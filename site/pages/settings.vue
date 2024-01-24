<template>
    <div class="settings">
        <h1>Settings</h1>
        <div class="switch-group">
            <InputSwitch id="lightMode" v-model="user.lightMode" />
            <label for="lightMode">Light mode<div class="explanation">For when you need a flashlight shining on your face</div></label>
            <InputSwitch id="reducedMotion" v-model="reducedMotion" disabled />
            <label for="reducedMotion">Reduced motion<div class="explanation">This option is set via your operating system. See <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion" target="_blank">here</a> for more information.</div></label>
            <InputSwitch id="squintMode" v-model="user.squintMode" />
            <label for="squintMode">Squinting mode<div class="explanation">Adds slider beneath card to blur the card</div></label>
        </div>
        <Panel class="statistics" header="Edit Eternal statistics" toggleable :collapsed="true"
            :pt="{
                content: {
                    style: 'display:flex; flex-direction:column; gap: 2rem;'
                }
            }">
            <div v-if="user.importedStats.played == 0"><Button icon="fa-solid fa-download" label="Import old stats" @click="importOldStats()" /></div>
            <div v-if="!oathSworn"><p>I declare on my honour that I will never use my powers for cheating.</p><Button icon="fa-solid fa-scroll" label="Swear oath" @click="oathSworn=true"/></div>
            <div><Statistics :editable="oathSworn" format="eternal" /></div>
        </Panel>
    </div>
</template>

<script setup>
const user = useUser();
const toast = useToast();

const oathSworn = ref(false);

function importOldStats() {
    if(user.importOldStats()) {
        toast.add({
            severity: 'success',
            summary: "Import old stats",
            detail: "Old stats found and successfully imported."
        });
    } else {
        toast.add({
            severity: 'error',
            summary: "Import old stats",
            detail: "No old stats found."
        });
    }
}

watch(() => user.lightMode, (newV, oldV) =>{
    location.reload(); 
});

const reducedMotion = computed(() => (window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true));
</script>

<style lang="scss" scoped>
.settings {
    max-width: 40rem;
    width: 70vw;
    margin: 0 auto;

    @media(max-width:400px) {
        width: 100%;
    }

    &>div:not(:first-child) {
        margin-top: 1rem;
    }
}

.switch-group {
    display: grid;
    grid-template-columns: min-content 1fr;
    align-items: center;
    gap: 1rem;

    & label {
        font-size: 1.2rem;
        .explanation {
            font-size: 0.9rem;
        }
    }
}
</style>