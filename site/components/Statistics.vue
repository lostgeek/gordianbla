<template>
    <div class="outer">
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
            <template v-for="(occurance, index) in stats.distribution">
                <div class="index">
                    {{ index + 1 }}
                </div>
                <div class="bar" :style="barStyle(occurance)"
                    :class="(occurance == 0) ? 'empty' : null">
                    <span class="occurance">
                        {{ occurance }}
                    </span>
                </div>
                <div v-if="editable" class="buttons">
                    <Button class="minus" icon="fa-solid fa-fw fa-minus" @click="user.offsetStats.distribution[index]--" />
                    <Button class="plus" icon="fa-solid fa-fw fa-plus" @click="user.offsetStats.distribution[index]++" />
                    <Button class="reset" icon="fa-solid fa-fw fa-rotate-left"
                    @click="user.offsetStats.distribution[index] = 0"
                    :disabled="user.offsetStats.distribution[index] == 0"
                    />
                </div>
            </template>
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
.outer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    @media(max-height:600px) {
        gap: .5rem;
    }

    @media(max-height:400px) {
        gap: .25rem;
    }
}
.statistics {
    font-family: 'Patua One', cursive;
    display: flex;
    justify-content: center;
    gap: 2rem;

    @media(max-width:600px) {
        gap: 1rem;
    }

    @media(max-width:400px) {
        gap: .5rem;
    }

    & .stat {
        width: min-content;

        & .number {
            text-align: center;
            font-size: 3rem;

            @media(max-height:600px) {
                font-size: 2.5rem;
            }

            @media(max-height:400px) {
                font-size: 2rem;
            }

            font-weight: bold;
        }

        & .label {
            text-align: center;
            font-size: 1rem;
            
            @media(max-height:600px) {
                font-size: .9rem;
            }

            @media(max-height:400px) {
                font-size: .8rem;
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
    font-family: 'Patua One', cursive;

    display: grid;
    grid-template-columns: 2rem 1fr;

    &.editable {
        grid-template-columns: 2rem 1fr 6rem;
    }

    width: 85%;

    white-space: nowrap;
    font-weight: bold;

    row-gap: .5rem;
    @media(max-height:600px) {
        row-gap: .25rem;
    }

    & .index, & .bar {
        font-size: 1.2rem;
        height: 1.5rem;
        line-height: 1.5rem;

        @media(max-height:600px) {
            font-size: 1rem;
            height: 1.2rem;
            line-height: 1.2rem;
        }
        @media(max-height:400px) {
            font-size: .9rem;
            height: 1rem;
            line-height: 1rem;
        }
    }


    & .index {
        text-align: center;
    }

    & .bar {
        text-align: right;
        padding-right: .75rem;
        min-width: 2rem;
        background: var(--correct-color);

        &.empty {
            text-align:center;
            padding-right: 0;
            background: var(--not-guessed-color);
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
.distribution .buttons {
    padding-left: 1rem;

    .reset {
        width: min-content;
        aspect-ratio: 1/1;
        padding: 3px 2px;
    }
}
</style>