<template>
    <div class="settings">
        <h1>Settings</h1>
        <div class="switch-group">
            <InputSwitch id="lightMode" v-model="user.lightMode" />
            <label for="lightMode">Light mode<div class="explanation">For when you need a flashlight shining on your face</div></label>
        </div>
    </div>
</template>

<script setup>
const user = useUser();

watch(() => user.lightMode, (newV, oldV) =>{
    location.reload(); 
});
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