<template>
    <Menubar class="header" :model="items" breakpoint="850px">
        <template #start>
            <NuxtLink class="headerLink" to="/daily/eternal">Gordian Blade</NuxtLink>
        </template>
        <template #item="{ item, props, hasSubmenu }">
            <NuxtLink v-ripple class="p-ripple p-menuitem-link" v-if="item.route" :to="item.route">
                <span class="p-menuitem-icon" :class="item.icon" />
                <span class="p-menuitem-text">{{ item.label }}</span>
                <Badge v-if="item.badge" :severity="item.badge.severity" :value="item.badge.value" />
            </NuxtLink>
            <a v-else v-ripple class="p-ripple p-menuitem-link" :href="item.url" :target="item.target" v-bind="props.action">
                <span class="p-menuitem-icon" :class="item.icon" />
                <span class="p-menuitem-text">{{ item.label }}</span>
                <Badge v-if="item.badge" :severity="item.badge.severity" :value="item.badge.value" />
                <span v-if="hasSubmenu" class="p-submenu-icon fa-solid fa-caret-down" />
            </a>
        </template>
    </Menubar>
</template>

<script setup>
const loaded = useState('siteLoaded', () => false);

const user = useUser();

const { data: newestArticle } = await useAsyncData('newestArticle', () => queryContent('news')
    .sort({ publishedAt: -1 })
    .find(),
    { transform: (articles) => articles[0] }); // findOne does not work for some reason

const unreadArticles = computed(() => {
    console.log("newest:", newestArticle.value);
    if(newestArticle.value && newestArticle.value.id > user.newestArticleViewed) {
        return {severity: 'primary', value: "New update!"};
    }
});

const route = useRoute();
const items = ref([
    {
        label: 'Daily Puzzle',
        icon: 'fa-solid fa-calendar',
        items: [
            {
                label: 'Eternal',
                route: '/daily/eternal',
            },
            {
                label: 'Standard',
                route: '/daily/standard',
            },
            {
                label: 'Neo (All-NSG)',
                route: '/daily/neo',
            },
            {
                label: 'Startup',
                route: '/daily/startup',
            },
        ],
    },
    {
        label: 'Rules',
        visible: () => (route.path.startsWith("/daily") || route.path == '/practice'),
        icon: 'fa-solid fa-scale-balanced',
        active: loaded,
        command: showRules,
    },
    {
        label: 'Statistics',
        visible: () => route.path.startsWith("/daily"),
        icon: 'fa-solid fa-chart-simple',
        command: showStatistics,
    },
    {
        label: 'News',
        icon: 'fa-solid fa-newspaper',
        badge: unreadArticles,
        route: '/news',
    },
    {
        label: 'Settings',
        icon: 'fa-solid fa-gears',
        route: '/settings',
    },
    {
        label: 'More',
        icon: 'fa-solid fa-ellipsis',
        class: 'open-left',
        items: [
            {
                label: 'Practice',
                icon: 'fa-solid fa-fw fa-gamepad',
                route: '/practice',
            },
            {
                label: 'RSS Feeds',
                icon: 'fa-solid fa-fw fa-rss',
                route: '/rss',
            },
            {
                label: 'About',
                icon: 'fa-solid fa-fw fa-circle-info',
                route: '/about',
            },
        ],
    },
])
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
.p-badge {
    margin-left: .25rem;
}

.header:deep(.open-left .p-submenu-list) {
    right: 0;
    left: initial !important;
}

@media(max-width:850px) {
    .header:deep(.p-menuitem-icon) {
        // copied from .fa-fw
        text-align: center;
        width: 1.25em;
    }
}
</style>