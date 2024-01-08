<template>
    <Menubar :model="items" breakpoint="750px">
        <template #start>
            <NuxtLink class="headerLink" to="/">Gordian Blade</NuxtLink>
        </template>
        <template #item="{ item, props, hasSubmenu }">
            <NuxtLink v-ripple class="p-ripple p-menuitem-link" v-if="item.route" :to="item.route">
                <span class="p-menuitem-icon" :class="item.icon" />
                <span class="p-menuitem-text">{{ item.label }}</span>
            </NuxtLink>
            <a v-else v-ripple class="p-ripple p-menuitem-link" :href="item.url" :target="item.target" v-bind="props.action">
                <span class="p-menuitem-icon" :class="item.icon" />
                <span class="p-menuitem-text">{{ item.label }}</span>
                <span v-if="hasSubmenu" class="p-submenu-icon fa-solid fa-caret-down" />
            </a>
        </template>
    </Menubar>
</template>

<script setup>
const loaded = useState('siteLoaded', () => false);

const route = useRoute();
const items = ref([
    {
        label: 'Rules',
        visible: () => route.path == "/",
        icon: 'fa-solid fa-scale-balanced',
        active: loaded,
        command: showRules,
    },
    {
        label: 'Statistics',
        visible: () => route.path == "/",
        icon: 'fa-solid fa-chart-simple',
        command: showStatistics,
    },
    {
        label: 'Settings',
        icon: 'fa-solid fa-gears',
        route: '/settings',
    },
    {
        label: 'More',
        icon: 'fa-solid fa-ellipsis',
        items: [
            {
                label: 'About',
                icon: 'fa-solid fa-circle-info',
                route: '/about',
            },
        ],
    },
])
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
.headerLink {
    color: var(--text-color);
    text-decoration: none;
    font-family: 'Patua One', cursive;
    font-size: 2rem;
}
.p-menubar {
    width: 100%;
    margin-bottom: 1rem;
    justify-content: space-between;
}
</style>