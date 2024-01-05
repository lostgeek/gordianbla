<template>
    <Dialog v-model:visible="rulesVisible" modal header="How to play" :pt="{
        mask: {
            style: 'backdrop-filter: blur(2px)'
        }
    }" :style="{ width: '30rem' }" :breakpoints="{ '320px': '100%' }">
    <p>
        Guess the card in 6 tries or fewer.
        With every wrong guess, more and more shapes will be revealed that make up the card.
    </p>
    <div class="outerPuzzle">
        <Puzzle :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
        <div class="outerGuessCounter">
            <Knob class="guessCounter" v-model="revealLevel" :min="0" :max="6" valueTemplate="" /> 
            {{ guessCounterText }}
        </div>
    </div>
    <p>
        After each guess you will see whether you guessed the faction, card type, <a @click="toggleSubtypeOverlay">subtype</a>, and <a @click="toggleCostOverlay">cost</a> correctly.
        <OverlayPanel ref="showSubtypeOverlay" :style="{ width: '20rem' }" :breakpoints="{ '320px': '100%' }">
            For the subtype there are some finer rules:
            <ol>
                <li>If the target card has no subtypes, this check will be shown as correct if the guessed card has no subtypes, otherwise shown as incorrect.</li>
                <li>If the target card has subtypes, this check will show how many of those appear on the guessed card.</li>
            </ol>
        </OverlayPanel>
        <OverlayPanel ref="showCostOverlay" :style="{ width: '20rem' }" :breakpoints="{ '320px': '100%' }">
            <p>If the card is an agenda, the advancement requirement will be used for the cost check.</p>
            <p>If the card is has a play or install cost, that cost will be used for the cost check.</p>
            <p>If the cost of a card is X, it will only be shown as correct if the guessed card also has a cost of X.</p>
        </OverlayPanel>
    </p>
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
cardSvg.value = await gordian.startPracticePuzzle(props.cards, '2694c33e-abc0-11ee-a012-4a69bb808f2a');
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

const showSubtypeOverlay = ref();
const toggleSubtypeOverlay = (event) => {
    showSubtypeOverlay.value.toggle(event);
};

const showCostOverlay = ref();
const toggleCostOverlay = (event) => {
    showCostOverlay.value.toggle(event);
};
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

p {
    margin-bottom: 1rem;
    &:first-child {
        margin-top: 0;
    }
    &:not(:first-child) {
        margin-top: 0.5rem;
    }
}
</style>