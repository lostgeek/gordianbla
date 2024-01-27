<script setup>
const props = defineProps(['guesses']);

function factionClass(guess) {
    if (guess.state == 'not-guessed') {
        return 'not-guessed';
    } else {
        return (guess.checks.faction) ? 'correct' : 'incorrect';
    }
}

function typeClass(guess) {
    if (guess.state == 'not-guessed') {
        return 'not-guessed';
    } else {
        return (guess.checks.type) ? 'correct' : 'incorrect';
    }
}

function subtypeClass(guess) {
    if (guess.state == 'not-guessed') {
        return 'not-guessed';
    } else {
        return guess.checks.subtype.class;
    }
}

function costClass(guess) {
    if (guess.state == 'not-guessed') {
        return 'not-guessed';
    } else {
        return (guess.checks.cost) ? 'correct' : 'incorrect';
    }
}

function titleClass(guess) {
    if (guess.state == 'not-guessed') {
        return 'not-guessed';
    } else {
        return (guess.checks.title) ? 'correct' : 'incorrect';
    }
}
</script>

<template>
    <div class="guessesDisplay">
        <div class="guessColumn faction">
            <div class="guessHeader">
                Faction
            </div>
            <div class="guess" v-for="guess in guesses" :class="factionClass(guess)">
                <div class="face front"></div>
                <div class="face back"></div>
            </div>
        </div>
        <div class="guessColumn type">
            <div class="guessHeader">
                Type
            </div>
            <div class="guess" v-for="guess in guesses" :class="typeClass(guess)">
                <div class="face front"></div>
                <div class="face back"></div>
            </div>
        </div>
        <div class="guessColumn subtype">
            <div class="guessHeader">
                Subtype
            </div>
            <div class="guess" v-for="guess in guesses" :class="subtypeClass(guess)">
                <div class="face front"></div>
                <div class="face back"></div>
            </div>
        </div>
        <div class="guessColumn cost">
            <div class="guessHeader">
                (Adv.) Cost
            </div>
            <div class="guess" v-for="guess in guesses" :class="costClass(guess)">
                <div class="face front"></div>
                <div class="face back"></div>
            </div>
        </div>
        <div class="guessColumn title">
            <div class="guessHeader">
                Card Title
            </div>
            <div class="guess title" v-for="guess in guesses" :class="titleClass(guess)">
                <div class="face front"></div>
                <div class="face back">{{ guess.guessedTitle }}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.guessesDisplay {
    display: flex;
    flex-direction: row;
    justify-content: center;
    color: var(--text-color);

    gap: 1rem;
    @media(max-width:1000px) {
        gap: .5rem;
    }
    @media(max-width:400px) {
        gap: .25rem;
    }
}

.guessColumn {
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    @media(max-width:1000px) {
        gap: .5rem;
    }
    @media(max-width:400px) {
        gap: .25rem;
    }

    &.title {
        flex-grow: 1;
        min-width: 7rem;
    }

    & .guessHeader {
        font-family: 'Patua One', system-ui, sans-serif;
        text-align: center;
        white-space: nowrap;

        font-size: 1.5rem;

        @media(max-width:1000px) {
            font-size: 1rem;
        }
        @media(max-width:400px) {
            font-size: .6rem;
        }
    }

}


.guess {
    width: 4rem;
    height: 4rem;
    @media(max-width:1000px) {
        width: 3rem;
        height: 3rem;
    }
    @media(max-width:400px) {
        width: 2rem;
        height: 2rem;
    }
    perspective: 1000px;
    @media not (prefers-reduced-motion) {
        -webkit-transition: transform 1s linear !important;
        -moz-transition: transform 1s linear !important;
        -o-transition: transform 1s linear !important;
        transition: transform 1s linear !important;
    }
    transform-style: preserve-3d;

    &.title {
        width: 100%;
    }

    &.cost {
        font-size: 3rem !important;
    }

    &:not(.not-guessed) {
        transform: rotateX(180deg);
        -webkit-transform: rotateX(180deg);
        -moz-transform: rotateX(180deg);
        -ms-transform: rotateX(180deg);
    }

    & .front,
    & .back {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        position: absolute;
        width: 100%;
        height: 100%;

        font-family: 'Medula One', system-ui, sans-serif;
        font-size: 2rem;
        @media(max-width:768px) {
            font-size: 1.5rem;
        }
        @media(max-width:320px) {
            font-size: 1rem;
        }
        border: 2px solid var(--guess-border);

        margin: auto;
        text-align: center;
        align-items: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    & .front {
        z-index: 2;
        background: var(--not-guessed-color);
    }

    & .back {
        transform: rotateX(180deg);
        -webkit-transform: rotateX(180deg);
        -moz-transform: rotateX(180deg);
        -ms-transform: rotateX(180deg);
        z-index: 1;
    }

    &.not-guessed .back {
        background: var(--not-guessed-color);
    }

    &.incorrect .back {
        background: var(--incorrect-color);
    }

    &.correct .back {
        background: var(--correct-color);
    }

    &.partial-0-1 .back,
    &.partial-0-2 .back,
    &.partial-0-3 .back,
    &.partial-0-4 .back,
    &.partial-0-5 .back {
        background: var(--incorrect-color);
    }

    &.partial-0-0 .back,
    &.partial-1-1 .back,
    &.partial-2-2 .back,
    &.partial-3-3 .back,
    &.partial-4-4 .back,
    &.partial-5-5 .back {
        background: var(--correct-color);
    }

    &.partial-1-2 .back,
    &.partial-2-4 .back {
        background-image: conic-gradient(from -90deg, var(--correct-color) 0deg 180deg, var(--incorrect-color) 180deg 360deg);
    }

    &.partial-1-3 .back {
        background-image: conic-gradient(var(--correct-color) 0deg 120deg, var(--incorrect-color) 120deg 360deg);
    }

    &.partial-2-3 .back {
        background-image: conic-gradient(var(--correct-color) 0deg 240deg, var(--incorrect-color) 240deg 360deg);
    }

    &.partial-1-4 .back {
        background-image: conic-gradient(from -90deg, var(--correct-color) 0deg 90deg, var(--incorrect-color) 90deg 360deg);
    }

    &.partial-3-4 .back {
        background-image: conic-gradient(from -180deg, var(--correct-color) 0deg 270deg, var(--incorrect-color) 270deg 360deg);
    }

    &.partial-1-5 .back {
        background-image: conic-gradient(var(--correct-color) 0deg 72deg, var(--incorrect-color) 72deg 360deg);
    }

    &.partial-2-5 .back {
        background-image: conic-gradient(var(--correct-color) 0deg 144deg, var(--incorrect-color) 144deg 360deg);
    }

    &.partial-3-5 .back {
        background-image: conic-gradient(var(--correct-color) 0deg 216deg, var(--incorrect-color) 216deg 360deg);
    }

    &.partial-4-5 .back {
        background-image: conic-gradient(var(--correct-color) 0deg 288deg, var(--incorrect-color) 288deg 360deg);
    }
}
</style>