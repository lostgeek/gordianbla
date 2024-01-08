<template>
    <div class="settings">
        <h1>Settings</h1>
        <div class="switch-group">
            <InputSwitch id="lightMode" v-model="user.lightMode" />
            <label for="lightMode">Light mode<div class="explanation">For when you need a flashlight shining on your face</div></label>
            <InputSwitch id="reducedMotion" v-model="reducedMotion" disabled />
            <label for="reducedMotion">Reduced motion<div class="explanation">This option is set via your operating system. See <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion" target="_blank">here</a> for more information.</div></label>
        </div>
    </div>
</template>

<script setup>
const user = useUser();

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