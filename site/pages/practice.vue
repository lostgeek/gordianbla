<template>
    <div v-if="format">
        <div v-if="loaded">
            <div class="main">
                <div class="left">
                    <GuessTable :guesses="gordian.guesses.value" />
                    <CardInputField v-if="!gordian.solved.value" :cards="filteredCards" @submit="(card) => gordian.guess(card)" />
                    <div class="buttons">
                        <Button icon="fa-solid fa-left-long" class="small" label="Back" @click="format=null"/>
                        <Button v-if="gordian.solved.value" icon="fa-solid fa-arrows-rotate" class="small" label="New Puzzle" @click="newPuzzle()"/>
                    </div>
                </div>
                <div class="right">
                    <Puzzle v-if="cardSvg" :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
                </div>
            </div>
            <RulesDialog :cards="nrdb.cards" :imageUrlTemplate="nrdb.imageUrlTemplate" />
        </div>
        <div v-else>
            <div class="main">
                <div class="left">
                    <GuessTable :guesses='[{state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }, { state: "not-guessed" }]' />
                    <Skeleton width="100%" height="3rem" />
                    <Skeleton class="small" height="3rem" />
                </div>
                <div class="right">
                    <Skeleton class="puzzleSkeleton" width="100%" height="auto"/>
                </div>
            </div>
        </div>
    </div>
    <div class="format" v-else>
        <p>
        Choose your format:
        </p>
        <Listbox v-model="format" :options="formats" optionLabel="name" />
    </div>
</template>

<script setup>
const loaded = useState('siteLoaded', () => false);

// Dialogs
const rulesVisible = useState('rulesVisible', () => false);

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
    if(gordian.solved.value) {
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
        console.log(name, message);
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }
    formats.value = [
        {
            name: 'Standard',
            packs: nrdb.packsInCycles([
                'kitara',
                'reign-and-reverie',
                'magnum-opus',
                'ashes',
                'magnum-opus-reprint',
                'system-gateway',
                'system-update-2021',
                'borealis',
                'liberation',
            ])
        },
        {
            name: 'Neo (All-NSG)',
            packs: nrdb.packsInCycles([
                'ashes',
                'system-gateway',
                'system-update-2021',
                'borealis',
                'liberation',
            ])
        },
        {
            name: 'Startup',
            packs: nrdb.packsInCycles([
                'system-gateway',
                'system-update-2021',
                'liberation',
            ])
        },
        {
            name: 'Eternal',
            packs: null
        },
    ];
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
        console.log(name, message);
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }
});

</script>

<style lang="scss" scoped>
.format {
    max-width: 40rem;
    width: 70vw;
    margin: 0 auto;

    @media(max-width:400px) {
        width: 100%;
    }
}
.main {
    display: flex;
    flex-wrap: wrap;
    margin: 0 1rem;
    gap: 1rem;
    justify-content: center;

    @media(max-width:1000px) {
        margin: 0 .5rem;
        gap: .5rem;
    }

    @media(max-width:400px) {
        margin: 0 .25rem;
        gap: .25rem;
    }
}

.left {
    flex-grow: 2;

    display: flex;
    flex-direction: column;

    gap: 1rem;

    @media(max-width:1000px) {
        gap: .5rem;
    }

    @media(max-width:400px) {
        gap: .25rem;
    }

    .buttons {
        display:flex;
        gap: 1rem;
    } 
}

.right {
    flex-grow: 5;

    min-width: 15rem;
    max-width: 26rem;

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