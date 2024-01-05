<template>
    <Dialog v-model:visible="rulesVisible" modal header="How to play" :pt="{
        mask: {
            style: 'backdrop-filter: blur(2px)'
        }
    }" :style="{ width: '30rem' }" :breakpoints="{ '320px': '100%' }">
    <p>
    Guess the displayed card in 6 tries or fewer.
    With every wrong guess, more and more shapes will be revealed that make up the card.
    </p>
    <div class="outerPuzzle">
        <Puzzle :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
        <div class="outerGuessCounter">
            <Knob class="guessCounter" v-model="revealLevel" :min="0" :max="6" valueTemplate="" /> 
            {{ guessCounterText }}
        </div>
    </div>
    </Dialog>
</template>

<script setup>
const rulesVisible = useState('rulesVisible', () => false);
const props = defineProps(['cards', 'imageUrlTemplate']);

const gordian = useGordian();

const revealLevel = ref(0);
const guessCounterText = computed(() => {
    if(revealLevel.value == 0) {
        return "Initial state";
    } else if (revealLevel.value < 6) {
        const cardinal = ["first", "second", "third", "fourth", "fifth"];
        return `After ${cardinal[revealLevel.value-1]} guess`;
    } else {
        return "Revealed puzzle";
    }
    });

const cardSvg = ref(null);
cardSvg.value = await gordian.startPuzzle(props.cards, 0);
const puzzleMode = computed(() => gordian.puzzleAttr.value.mode);
const cardUrl = computed(() => props.imageUrlTemplate.replace('{code}', gordian.puzzleAttr.value.nrdbID));

onMounted(() => {
    setTimeout((event) => {
        setInterval((event) => {
            if (revealLevel.value < 6) {
                revealLevel.value++;
            }
        }, 3000)
    }, 2500);
});

watch(rulesVisible, (newV, oldV) => {
    if(newV == true) {
        revealLevel.value = 0;
    }
});
</script>

<style lang="scss" scoped>
.outerPuzzle {
    display:flex;
    justify-content: center;
    align-items: center;

    &>* {
        width: 50%;
    }

    .puzzleContainer {
        margin: 0 1rem;
    }

    .outerGuessCounter {
        display:flex;
        flex-direction: column;
        align-items: center;
    }
}
</style>