<template>
    <div class="statistics">
        <div class="stat">
            <div class="number">{{ stats.played }}</div>
            <div v-if="editable" class="buttons">
                <Button class="minus" icon="fa-solid fa-fw fa-minus" @click="user.offsetStats.played--" />
                <Button class="plus" icon="fa-solid fa-fw fa-plus" @click="user.offsetStats.played++" />
                <Button class="reset" size="small" icon="fa-solid fa-fw fa-rotate-left" label="Reset"
                    @click="user.offsetStats.played = 0" 
                    :disabled="user.offsetStats.played == 0" />
            </div>
            <div class="label">Played</div>
        </div>
        <div class="stat">
            <div class="number">{{ (stats.wins / stats.played * 100).toFixed(0) }}</div>
            <div v-if="editable" class="buttons"></div>
            <div class="label">Win %</div>
        </div>
        <div class="stat">
            <div class="number">{{ stats.streak }}</div>
            <div v-if="editable" class="buttons"></div>
            <div class="label">Current streak</div>
        </div>
        <div class="stat">
            <div class="number">{{ stats.maxStreak }}</div>
            <div v-if="editable" class="buttons">
                <Button class="minus" icon="fa-solid fa-fw fa-minus" @click="user.offsetStats.maxStreak--" />
                <Button class="plus" icon="fa-solid fa-fw fa-plus" @click="user.offsetStats.maxStreak++" />
                <Button class="reset" size="small" icon="fa-solid fa-fw fa-rotate-left" label="Reset"
                    @click="user.offsetStats.maxStreak = 0" 
                    :disabled="user.offsetStats.maxStreak == 0" />
            </div>
            <div class="label">Max streak</div>
        </div>
    </div>
    <div class="distribution" :class="(editable) ? 'editable' : null">
        <div class="bar" v-for="(occurance, index) in stats.distribution" :style="barStyle(occurance)"
            :class="(occurance == 0) ? 'empty' : null">
            <span class="index">
                {{ index + 1 }}
            </span>
            <span class="occurance">
                {{ occurance }}
            </span>
            <div v-if="editable" class="buttons">
                <Button class="minus" icon="fa-solid fa-fw fa-minus" @click="user.offsetStats.distribution[index]--" />
                <Button class="plus" icon="fa-solid fa-fw fa-plus" @click="user.offsetStats.distribution[index]++" />
                <Button class="reset" icon="fa-solid fa-fw fa-rotate-left"
                 @click="user.offsetStats.distribution[index] = 0"
                 :disabled="user.offsetStats.distribution[index] == 0"
                  />
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    editable: { default: false },
});

const user = useUser();
const stats = computed(() => user.stats);

function barStyle(occurance) {
    return { width: `${occurance / Math.max.apply(null, stats.value.distribution) * 100}%` };
}

</script>

<style lang="scss" scoped>
.statistics {
    font-family: 'Patua One', cursive;
    margin: 1rem auto;
    display: flex;
    justify-content: center;
    gap: 2rem;

    @media(max-width:768px) {
        gap: .5rem;
    }

    @media(max-width:320px) {
        gap: .25rem;
    }

    & .stat {
        width: min-content;

        & .number {
            text-align: center;
            font-size: 3rem;

            @media(max-width:768px) {
                font-size: 2.5rem;
            }

            @media(max-width:320px) {
                font-size: 2rem;
            }

            font-weight: bold;
        }

        & .label {
            text-align: center;
            font-size: 1rem;

            @media(max-width:768px) {
                font-size: 1.25rem;
            }

            @media(max-width:320px) {
                font-size: 1rem;
            }
        }

        & .buttons {
            display: grid;
            grid-template-areas:
                "minus plus"
                "reset reset";
            justify-items: center;
            gap: .25rem;

            height: 3.5rem;
            margin-bottom: .25rem;

            & .minus {
                grid-area: minus;
                justify-self: self-end;
            }
            & .plus {
                grid-area: plus;
                justify-self: self-start;
            }
            & .reset {
                grid-area: reset;
            }

        }
    }
}

.distribution {
    position: relative;
    max-width: 20rem;
    margin: 1rem auto;
    width: 100%;
    @media(max-width:600px) {
        width: 50%;
    }
    &.editable {
        left: -2rem;
    }

    & .bar {
        height: 1.5rem;
        background: var(--correct-color);
        margin: 1rem 0;
        min-width: 2rem;

        &.empty {
            background: var(--not-guessed-color);
        }
    }

    & .index,
    & .occurance {
        white-space: nowrap;
        font-size: 1.2rem;
        line-height: 1.5rem;
        font-weight: bold;
    }

    & .index {
        float: left;
        position: relative;
        left: -1.5rem;
    }

    & .occurance {
        float: right;
        margin-right: .5rem
    }

    & .buttons {
        position: absolute;
        right: 0;
        transform: translateX(100%) translateX(.5rem);
        display: flex;
        gap: .25rem;

        .reset {
            width: min-content;
            aspect-ratio: 1/1;
            padding: 3px 2px;
        }
    }
}

.minus, .plus {
    width: min-content;
    aspect-ratio: 1/1;
    padding: 3px 2px;
}
.reset {
    padding: .25rem .4rem;
}
</style>