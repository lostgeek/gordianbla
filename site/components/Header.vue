<template>
    <div class='header'>
        <div class='left'></div>
        <div class="center"><NuxtLink class="headerlink" to="/">Gordian Blade</NuxtLink></div>
        <div class='right'>
            <Button v-tooltip.bottom="'RSS'" icon="fa-solid fa-rss" size="large" text @click="notImplemented" />
            <Button @click="showRules" v-tooltip.bottom="'Rules'" icon="fa-solid fa-scale-balanced" size="large" text />
            <Button @click="showStatistics" v-tooltip.bottom="'Share'" icon="fa-solid fa-share-nodes" size="large" text />
            <Button v-tooltip.bottom="'Settings'" icon="fa-solid fa-gears" size="large" text @click="notImplemented" />
            <NuxtLink to="/about" v-tooltip.left="'About'" class="p-button p-component p-button-icon-only p-button-text p-button-lg">
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

    display:grid;
    grid-template-columns: 1fr 3fr 1fr;

    @media(max-width:600px) {
        grid-template-columns: 2fr 2fr;
        .left {
            display: none;
        }
    }

    & .center {
        font-size: 2rem;
        font-family: 'Patua One', Arial;
        display:flex;
        justify-content: center;
        align-items: center;

        @media(max-width:600px) {
            justify-content: flex-start;
            padding-left: .5rem;
            font-size: 1.5rem;
        }
        @media(max-width:400px) {
        font-size: 1.2rem;
        }
    }

    & .headerlink {
        color: var(--text-color);
        text-decoration: none;
    }

    & .right {
        display: flex;
        justify-content: flex-end;
    }
}

a>.material-symbols-outlined {
    color: var(--text-color);
}
</style>