<template>
    <Splitter :layout="getLayout">
        <SplitterPanel class="left" :size="75">
            <template v-if="loaded">
                <GuessTable :guesses="gordian.guesses.value" />
                <CardInputField :class="(gordian.finished.value)?'hidden':none" :cards="cards" @submit="(card) => gordian.guess(card)" />
            </template>
            <template v-else>
                <GuessTable
                    :guesses='[{ state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }]' />
                <Skeleton width="100%" height="3rem" />
            </template>
        </SplitterPanel>
        <SplitterPanel class="right" :size="25">
            <Tag class="clickable" icon="fa-solid fa-calendar" @click="toggleFormatMenu">
                <template #default>
                    <span>Format: {{formatLabel[format]}}</span>
                </template>
            </Tag>
            <Menu ref="formatMenu" id="format_overlay" :model="formatMenuItems" :popup="true"
                :pt="{
                    root: {
                        style: 'min-width: 5rem;'
                    },
                    menu: {
                        style: 'font-size: .75rem;'
                    },
                }">
                <template #item="{ item }">
                    <NuxtLink v-ripple class="p-ripple p-menuitem-link" v-if="item.route" :to="item.route">
                        <span class="p-menuitem-text">{{ item.label }}</span>
                    </NuxtLink>
                </template>
            </Menu>
            <template v-if="loaded">
                <Puzzle v-if="cardSvg" :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl"
                    :cardSvg="cardSvg" />
            </template>
            <template v-else>
                <Skeleton class="puzzleSkeleton" width="100%" height="auto" />
            </template>
        </SplitterPanel>
    </Splitter>
    <StatisticsDialog :format="format" :gordian="gordian" />
    <RulesDialog />
</template>

<script setup>
const breakpoints = useBreakpoints({
    vert: 700,
})

const layoutBreakpoint = breakpoints.greater('vert');
const getLayout = computed(() => {
    if (layoutBreakpoint.value) {
        return 'horizontal';
    } else {
        return 'vertical';
    }
});

const route = useRoute();
const loaded = useState('siteLoaded', () => false);
if (!['eternal', 'standard', 'neo', 'startup'].includes(route.params.format)) {
    navigateTo('/daily/eternal');
}

const format = computed(() => route.params.format);
const formatLabel = ref({
    eternal: 'Eternal',
    standard: 'Standard',
    neo: 'Neo (All-NSG)',
    startup: 'Startup',
});
const formatMenu = ref();
function toggleFormatMenu(event) {
    formatMenu.value.toggle(event);
}
const formatMenuItems = ref([
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
]);
useSeoMeta({
  title: `Gordian Blade - ${formatLabel.value[format.value]}`,
  ogTitle: `Gordian Blade - ${formatLabel.value[format.value]}`,
  description: 'The daily Netrunner puzzle!',
  ogDescription: 'The daily Netrunner puzzle!',
  ogImage: 'https://gordianbla.de/android-chrome-192x192.png',
  twitterCard: 'summary_large_image',
})

const data = await $fetch(`/api/current_daily_puzzle?format=${format.value}`);
const currentDaily = data.daily;

// Dialogs
const statisticsVisible = useState('statisticsVisible', () => false);
const rulesVisible = useState('rulesVisible', () => false);

const toast = useToast();

const nrdb = useNrdb();
const cards = computed(() => {
    if (format.value == 'eternal') {
        return nrdb.cards;
    } else {
        return nrdb.cards.filter(c => nrdb.packsInFormat[format.value].map(f => f.code).includes(c.pack_code));
    }
});

const user = useUser();
const unsavedChanges = ref(false);

const gordian = useGordian();

watch(gordian.guesses, async (newG, oldG) => {
    try {
        if (gordian.puzzleAttr.value.dailyNumber) {
            unsavedChanges.value = true;
            if (format.value == 'eternal') {
                user.dailyHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
                await user.updateUser(['dailyHistory']);
            } else if (format.value == 'standard') {
                user.dailyStandardHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
                await user.updateUser(['dailyStandardHistory']);
            } else if (format.value == 'neo') {
                user.dailyNeoHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
                await user.updateUser(['dailyNeoHistory']);
            } else if (format.value == 'startup') {
                user.dailyStartupHistory[gordian.puzzleAttr.value.dailyNumber] = gordian.guesses.value;
                await user.updateUser(['dailyStartupHistory']);
            }
            unsavedChanges.value = false;
        }
    } catch (e) {
        if(e.status == 401) {
            console.log("401 error");
            toast.add({
                severity: 'error',
                summary: "Account Synchronisation",
                detail: "Authorisation failed: Server did not accept secret."
            });
        } else {
            toast.add({
                severity: 'error',
                summary: "Account Synchronisation",
                detail: e.message
            });
        }
    }

    if (gordian.finished.value) {
        if (oldG.length > 0) { // If this is not the page loading to a finished puzzle
            // Analytics
            useTrackEvent('solve_daily', { props: { format: format.value } });

            // Show statistics after 2.5s if still on the same page
            var formatBeforeTimeout = format.value;
            setTimeout(() => {
                var route = useRoute();
                if (route.path.startsWith(`/daily/${formatBeforeTimeout}`)) {
                    statisticsVisible.value = true;
                }
            }, 2500);
        }
    }
}, { deep: true });

const revealLevel = computed(() => {
    if (gordian.finished.value) {
        return 6;
    } else {
        return gordian.currentGuess.value;
    }
});
const puzzleMode = computed(() => gordian.puzzleAttr.value.mode);
const cardSvg = ref(null);
const cardUrl = computed(() => nrdb.imageUrlTemplate.replace('{code}', gordian.puzzleAttr.value.nrdbID));

onMounted(async () => {
    window.onbeforeunload = confirmExit;
    function confirmExit() {
        if (unsavedChanges.value) {
            toast.add({
                severity: 'warn',
                summary: "Unsaved changes",
                detail: "You have unsaved changes. Do you really want to exit?"
            });
            return "You have unsaved changes. Do you really want to exit?";
        }
    }

    if (user.importOldStats()) {
        toast.add({
            severity: 'success',
            summary: "Import old stats",
            detail: "Old stats found and imported. Welcome to the new Gordian Blade!"
        });
    }

    var errorsOccurred = false;

    try {
        await nrdb.fetch();

        var history;
        if (format.value == 'eternal') {
            history = user.dailyHistory[currentDaily];
        } else if (format.value == 'standard') {
            history = user.dailyStandardHistory[currentDaily];
        } else if (format.value == 'neo') {
            history = user.dailyNeoHistory[currentDaily];
        } else if (format.value == 'startup') {
            history = user.dailyStartupHistory[currentDaily];
        }
        cardSvg.value = await gordian.startDailyPuzzle(cards.value, currentDaily, format.value, history);

        // Show rules dialog if user has not played a daily yet
        if (!user.playedAnyGame) {
            setTimeout(() => {
                if (!user.playedAnyGame) {
                    rulesVisible.value = true;
                }
            }, 1000);
        }
    } catch ({ name, message }) {
        errorsOccurred = true;
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }

    try {
        await user.fetchUser();
    } catch (e) {
        if(e.status == 401) {
            console.log("401 error");
            toast.add({
                severity: 'error',
                summary: "Account Synchronisation",
                detail: "Authorisation failed: Server did not accept secret."
            });
        } else {
            errorsOccurred = true;
            toast.add({
                severity: 'error',
                summary: "Account Synchronisation",
                detail: e.message
            });
        }
    }

    if(!errorsOccurred) {
        loaded.value = true;
    }
});
</script>

<style lang="scss" scoped>
:deep(.left) {
    padding: 1rem;
    display: flex;
    flex-direction: column;

    gap: 1rem;
}

:deep(.right) {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 1rem;
    gap: 1rem;
    @media(max-width:1000px) {
        padding: .5rem;
        gap: .5rem;
    }
    @media(max-width:400px) {
        padding: .25rem;
        gap: .25rem;
    }

    &>* {
        flex-grow: 0;
    }

    & .sliderGroup {
        align-self: stretch;
    }

    @media(max-width:400px) {
        min-width: 0;
        width: 100%;
    }
}

.puzzleSkeleton {
    width: 100%;
    border-radius: 4.7% / 3.6%;
    aspect-ratio: 63.5/88;
}

.hidden {
    visibility: hidden;
}

.clickable {
    cursor: pointer;
}
</style>