<template>
    <Dialog v-model:visible="statisticsVisible" modal header="Statistics" :pt="{
        mask: {
            style: 'backdrop-filter: blur(2px)'
        }
    }">
        <div class="statistics">
            <div class="stat">
                <div class="number">{{ stats.played }}</div>
                <div class="label">Played</div>
            </div>
            <div class="stat">
                <div class="number">{{ stats.wins / stats.played * 100 }}</div>
                <div class="label">Win %</div>
            </div>
            <div class="stat">
                <div class="number">{{ stats.streak }}</div>
                <div class="label">Current streak</div>
            </div>
            <div class="stat">
                <div class="number">{{ stats.maxStreak }}</div>
                <div class="label">Max streak</div>
            </div>
        </div>
        <div class="distribution">
            <div class="bar" v-for="(occurance, index) in stats.distribution" :style="barStyle(occurance)"
                :class="(occurance == 0) ? 'empty' : null">
                <span class="index">
                    {{ index + 1 }}
                </span>
                <span class="occurance">
                    {{ occurance }}
                </span>
            </div>
        </div>
        <template #footer>
            <div class="footer">
                <div class="next">
                    Next puzzle
                    <div class="time">{{ nextPuzzle }}</div>
                </div>
                <div class="buttons">
                    <Button icon="fa-solid fa-gamepad" label="Continue practicing" @click="notImplemented" />
                    <Button icon="fa-solid fa-clipboard" label="Copy result" @click="copyResult()" />
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
const props = defineProps(['gordian']);
const toast = useToast();
function notImplemented() {
    toast.add({
        severity: 'warn',
        summary: 'Unimplemented',
        detail: 'Feature has not been implemented yet.',
        life: 2000
    });
}

const stats = computed(() => props.gordian.stats);

const statisticsVisible = useState('statisticsVisible', () => false);

function barStyle(occurance) {
    return { width: `${occurance / Math.max.apply(null, stats.value.distribution) * 100}%` };
}

const nextPuzzle = ref("");
setInterval(function () {
    const now = new Date();
    var nextPuzzleDate = new Date();
    nextPuzzleDate.setUTCDate(nextPuzzleDate.getUTCDate() + 1);
    nextPuzzleDate.setUTCHours(0);
    nextPuzzleDate.setUTCMinutes(0);
    nextPuzzleDate.setUTCSeconds(0);
    nextPuzzleDate.setUTCMilliseconds(0);
    const diff = nextPuzzleDate - now;
    var tmp = Math.floor(diff / (1000 * 60 * 60));
    tmp += ":" + String(Math.floor(diff / (1000 * 60) % 60)).padStart(2, '0');
    tmp += ":" + String(Math.floor(diff / 1000 % 60)).padStart(2, '0');
    nextPuzzle.value = tmp;
}, 1000);

function copyResult() {
    var text="";
    text = "gordianbla.de - " + props.gordian.puzzleAttr.dailyNumber + "\n";
    text += "Guesses: " + props.gordian.currentGuess + "/6";
    text += "\n";

    for (const g of props.gordian.guesses) {
        if (g.state != 'not-guessed') {
            if (g.checks.faction) {
                text += "🟩";
            } else {
                if (false) // check light mode
                    text += "⬜";
                else
                    text += "⬛";
            }

            if (g.checks.type) {
                text += "🟩";
            } else {
                if (false) // check light mode
                    text += "⬜";
                else
                    text += "⬛";
            }

            if (g.checks.subtype.total == 0) {
                if (g.state == 'correct') {
                    text += "🟩";
                } else {
                    if (false) // check light mode
                        text += "⬜";
                    else
                        text += "⬛";
                }
            } else {
                if (g.checks.subtype.hits == g.checks.subtype.total) {
                    text += "🟩";
                } else {
                    if (false) // check light mode
                        text += "⬜";
                    else
                        text += "⬛";
                }
            }
            if (g.checks.cost) {
                text += "🟩";
            } else {
                if (false) // check light mode
                    text += "⬜";
                else
                    text += "⬛";
            }

            if (g.state == 'correct') {
                text += "🟩";
            } else {
                if (false) // check light mode
                    text += "⬜";
                else
                    text += "⬛";
            }
            text += "\n";
        }
    }
    navigator.clipboard.writeText(text.trim());
    toast.add({severity: 'info', summary: "Sharing results", detail: "Text copied to clipboard.", life: 3000});
}
</script>

<style lang="scss" scoped>
.statistics {
    font-family: 'Patua One', cursive;
    margin: 1rem auto;
    display: flex;
    justify-content: center;
    gap: 1rem;

    & .stat {
        width: min-content;

        & .number {
            text-align: center;
            font-size: 3rem;
            font-weight: bold;
        }

        & .label {
            text-align: center;
        }
    }
}

.distribution {
    width: 50vw;
    max-width: 20rem;
    margin: 1rem auto;
    padding-left: 1.5rem;

    & .bar {
        height: 1.5rem;
        background: var(--correct-color);
        margin: 1rem 0;
        min-width: 2rem;

        &.empty {
            background: var(--empty-color);
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

    & .bar.empty .occurance {
        float: none;
        text-align: center;
        margin: 0;
    }
}

.footer {
    display: flex;
    gap: 2rem;
    justify-content: space-between;

    & .next {
        margin: 2rem;
        font-size: 1.5rem;
        text-align: center;

        flex-grow: 1;
        flex-shrink: 0;

        & .time {
            font-size: 2rem;
        }
    }

    & .buttons {
        flex-grow: 0;
        flex-shrink: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: .5rem;
    }
}
</style>