<template>
    <Dialog v-model:visible="rulesVisible" modal header="How to play" :pt="{
        mask: {
            style: 'backdrop-filter: blur(2px)'
        }
    }" :style="{ width: '40rem' }" :breakpoints="{ '600px': '100%' }">
    <p>
        Guess the card in 6 tries or fewer.
        With every wrong guess, more and more shapes will be revealed that make up the card.
    </p>
    <Fieldset legend="Example">
        <div class="exampleMain">
            <div class="exampleLeft">
                <GuessTable :guesses="gordian.guesses.value" />
            </div>
            <div class="exampleRight">
                <Puzzle :puzzleMode="puzzleMode" :revealLevel="revealLevel" :cardUrl="cardUrl" :cardSvg="cardSvg" />
            </div>
        </div>
    </Fieldset>
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

const revealLevel = computed(() => {
    if(gordian.solved.value) {
        return 6;
    } else {
        return gordian.currentGuess.value;
    }
});

const cardSvg = ref(null);
cardSvg.value = await gordian.startPracticePuzzle(props.cards, '2694c33e-abc0-11ee-a012-4a69bb808f2a');
const puzzleMode = computed(() => gordian.puzzleAttr.value.mode);
const cardUrl = computed(() => props.imageUrlTemplate.replace('{code}', gordian.puzzleAttr.value.nrdbID));

const guessCards = ['Creative Commission', 'Conduit', 'Takobi', 'Gordian Blade'];

var animInterval = null;
onMounted(() => {
    setTimeout((event) => {
        if (!animInterval) {
            animInterval = setInterval((event) => {
                if(revealLevel.value < guessCards.length) {
                    const card = props.cards.filter((c) => c.stripped_title == guessCards[revealLevel.value])[0];
                    gordian.guess(card);
                } else {
                    clearTimeout(animInterval);
                }
            }, 3000);
        }
    }, 2500);
});

watch(rulesVisible, (newV, oldV) => {
    if(newV == true) {
        gordian.initiateGuesses();
    } else {
        if(animInterval) {
            clearTimeout(animInterval);
        }
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

<style lang="scss">
@media(max-width:600px) {
    .p-fieldset {
        padding: 0;
    }
}

.exampleMain {
    display: flex;
    margin: 0;
    gap: 1rem;
}

.exampleLeft {
    flex-grow: 3;

    display: flex;
    flex-direction: column;

    gap: 1rem;
    @media(max-width:600px) {
        gap: 0.25rem!important;
    }
    & .guessesDisplay {
        gap: .5rem!important;
        @media(max-width:600px) {
            gap: 0.125rem!important;
        }
    }
    & .guessColumn {
        gap: .25rem!important;
        @media(max-width:600px) {
            gap: 0.125rem!important;
        }

        & .guessHeader {
            font-size: .8rem!important;
            @media(max-width:600px) {
                font-size: .5rem!important;
            }
        }

        &.title {
            min-width: 3rem!important;
        }

    }

    & .guess {
        width: 1.5rem!important;
        height: 1.5rem!important;
        @media(max-width:600px) {
            width: 1rem!important;
            height: 1rem!important;
        }

        &.title {
            width: 100%!important;
        }

        & .front,
        & .back {
            font-size: 1rem!important;
            @media(max-width:600px) {
                font-size: .8rem!important;
            }
            @media(max-width:400px) {
                font-size: .5rem!important;
            }
        }
    }
}


.exampleRight {
    width: 10rem;
    @media(max-width:600px) {
        width: 5rem!important;
    }
    flex-grow: 1;
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