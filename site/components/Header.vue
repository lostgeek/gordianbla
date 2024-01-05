<template>
    <div class='header'>
        <NuxtLink class="headerlink" to="/">Gordian Blade</NuxtLink>
        <div class='buttons right'>
            <Button v-tooltip.bottom="'RSS'" icon="fa-solid fa-rss" size="large" text @click="notImplemented" />
            <Button @click="showRules" v-tooltip.bottom="'Rules'" icon="fa-solid fa-scale-balanced" size="large" text />
            <Button @click="showStatistics" v-tooltip.bottom="'Share'" icon="fa-solid fa-share-nodes" size="large" text />
            <Button v-tooltip.bottom="'Settings'" icon="fa-solid fa-gears" size="large" text @click="notImplemented" />
            <NuxtLink to="/about" v-tooltip.bottom="'About'" class="p-button p-component p-button-icon-only p-button-text p-button-lg">
                <span class="p-button-icon fa-solid fa-circle-info" data-pc-section="icon"></span>
                <span class="p-button-label" data-pc-section="label">&nbsp;</span>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
const toast = useToast();
function notImplemented() {
    toast.add({
        severity: 'warn',
        summary: 'Unimplemented',
        detail: 'Feature has not been implemented yet.',
        life: 2000
    });
}

const statisticsVisible = useState('statisticsVisible', () => false);
const rulesVisible = useState('rulesVisible', () => false);

function showStatistics() {
    statisticsVisible.value = true;
}
function showRules() {
    rulesVisible.value = true;
}
</script>

<style lang="scss" scoped>
.header {
    padding: .5rem 0;

    font-size: 2rem;
    font-family: 'Patua One', Arial;
    text-align: center;

    & .headerlink {
        color: var(--text-color);
        text-decoration: none;
    }

    & .buttons {
        &.right {
            display: inline;
            position: absolute;
            right: 0;
            margin-right: 1rem;
        }
    }
}

a>.material-symbols-outlined {
    color: var(--text-color);
}
</style>