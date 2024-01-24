<template>
    <div v-if="format">
        <Splitter :layout="getLayout">
            <SplitterPanel class="left" :size="75">
                <template v-if="loaded">
                    <GuessTable :guesses="gordian.guesses.value" />
                    <CardInputField v-if="!gordian.finished.value" :cards="filteredCards" @submit="(card) => gordian.guess(card)" />
                    <div class="buttons">
                        <Button icon="fa-solid fa-left-long" class="small" label="Back" @click="format=null"/>
                        <Button v-if="gordian.finished.value" icon="fa-solid fa-arrows-rotate" class="small" label="New Puzzle" @click="newPuzzle()"/>
                    </div>
                </template>
                <template v-else>
                    <GuessTable :guesses='[{state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }]' />
                    <Skeleton width="100%" height="3rem" />
                </template>
            </SplitterPanel>
            <SplitterPanel class="right" :size="25">
                <template v-if="loaded">
                    <Puzzle v-if="cardSvg" :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
                </template>
                <template v-else>
                    <Skeleton class="puzzleSkeleton" width="100%" height="auto"/>
                </template>
            </SplitterPanel>
        </Splitter>
    </div>
    <div class="format" v-else>
        <p>
        Choose your format:
        </p>
        <Listbox v-model="format" :options="formats" optionLabel="name" />
    </div>
    <StatisticsDialog :format="format" :gordian="gordian" />
    <RulesDialog />
</template>

<script setup>
const loaded = useState('siteLoaded', () => false);

const breakpoints = useBreakpoints({
  vert: 700,
})

const layoutBreakpoint = breakpoints.greater('vert');
const getLayout = computed( () => {
    if (layoutBreakpoint.value) { 
        return 'horizontal';
    } else {
        return 'vertical';
    }
});

const toast = useToast();

const nrdb = useNrdb();

const gordian = useGordian();

const format = ref(null);
const formats = ref(null);

const filteredCards = computed(() => {
    if (format.value.packs && format.value.packs.length > 0) {
        return nrdb.cards.filter(c => {
            return format.value.packs.map(p => p.code).includes(c.pack_code);
        });
    } else {
        return nrdb.cards;
    }
});
const revealLevel = computed(() => {
    if(gordian.finished.value) {
        return 6;
    } else {
        return gordian.currentGuess.value;
    }
});
const puzzleMode = computed(() => gordian.puzzleAttr.value.mode);
const cardSvg = ref(null);
const cardUrl = computed(() => nrdb.imageUrlTemplate.replace('{code}', gordian.puzzleAttr.value.nrdbID));

onMounted(async () => {
    try {
        await callOnce(nrdb.fetch);
    } catch ({name, message}) {
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }
    formats.value = [
        {
            name: "Eternal",
            packs: nrdb.packsInFormat.eternal
        },
        {
            name: "Standard",
            packs: nrdb.packsInFormat.standard
        },
        {
            name: "Neo (All-NSG)",
            packs: nrdb.packsInFormat.neo
        },
        {
            name: "Startup",
            packs: nrdb.packsInFormat.startup
        },
    ];


    // Analytics
    watch(gordian.guesses, (newG, oldG) => {
        if (gordian.finished.value) {
            useTrackEvent('solve_practice', {props: {format: format.value.name}});
        }
    }, {deep: true});
});

async function newPuzzle() {
    var packs = null;
    if(format.value.packs && format.value.packs.length > 0) {
        packs = format.value.packs.map(p => p.code).join(',');
    }
    loaded.value = false;
    cardSvg.value = await gordian.startPracticePuzzle(nrdb.cards, packs);
    loaded.value = true;
}

watch(format, async () => {
    if(!format.value) {
        return;
    }
    try {
        await newPuzzle();
    } catch ({name, message}) {
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }
});
</script>

<style lang="scss" scoped>
:deep(.left) {
    padding: 1rem;
    display: flex;
    flex-direction: column;

    gap: 1rem;
    
    & .buttons {
        display:flex;
        gap: 1rem;
    } 
}

:deep(.right) {
    padding: 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;

    gap: 1rem;

    &>* {
        flex-grow: 0;
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
</style>