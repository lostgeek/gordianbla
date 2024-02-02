<template>
    <Toast />
    <Header />
    <slot />
</template>

<script setup>
const user = useUser();

if(user.lightMode) {
    import('~/assets/themes/material/material-light/compact/gordian/theme.scss');
} else {
    import('~/assets/themes/material/material-dark/compact/gordian/theme.scss');
}
</script>

<style>
</style>