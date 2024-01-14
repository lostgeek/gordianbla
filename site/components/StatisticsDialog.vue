<template>
    <Dialog v-model:visible="statisticsVisible" modal header="Statistics" :pt="{
        mask: {
            style: 'backdrop-filter: blur(2px)'
        }
    }" :style="{ width: '30rem' }" :breakpoints="{ '320px': '100%' }">
        <Statistics />
        <template #footer>
            <div class="footer">
                <div class="next">
                    Next puzzle: <span class="time">{{ nextPuzzle }}</span>
                </div>
                <div class="buttons">
                    <Button v-if="gordian.solved.value" icon="fa-solid fa-clipboard" label="Copy result"
                        @click="copyResult()" />
                    <div>
                        <Checkbox v-model="user.exportSettings.discordSpoiler" :binary="true" inputId="discordSpoiler" name="discordSpoiler"/>
                        <label for="discordSpoiler"> Discord spoiler </label>
                    </div>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
const props = defineProps(['gordian']);

const user = useUser();
const stats = computed(() => user.stats);

const toast = useToast();

const statisticsVisible = useState('statisticsVisible', () => false);

function barStyle(occurance) {
    return { width: `${occurance / Math.max.apply(null, stats.distribution) * 100}%` };
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
    text = "gordianbla.de - " + props.gordian.puzzleAttr.value.dailyNumber + "\n";
    text += "Guesses: " + props.gordian.currentGuess.value + "/6";
    text += "\n";

    for (const g of props.gordian.guesses.value) {
        if (g.state != 'not-guessed') {
            if (g.checks.faction) {
                text += "🟩";
            } else {
                if (user.lightMode)
                    text += "⬜";
                else text += "⬛";
            }

            if (g.checks.type) {
                text += "🟩";
            } else {
                if (user.lightMode)
                    text += "⬜";
                else
                    text += "⬛";
            }

            if (g.checks.subtype.total == 0) {
                if (g.state == 'correct') {
                    text += "🟩";
                } else {
                    if (user.lightMode)
                        text += "⬜";
                    else
                        text += "⬛";
                }
            } else {
                if (g.checks.subtype.hits == g.checks.subtype.total) {
                    text += "🟩";
                } else {
                    if (user.lightMode)
                        text += "⬜";
                    else
                        text += "⬛";
                }
            }
            if (g.checks.cost) {
                text += "🟩";
            } else {
                if (user.lightMode)
                    text += "⬜";
                else
                    text += "⬛";
            }

            if (g.checks.title) {
                text += "🟩";
            } else {
                if (user.lightMode)
                    text += "⬜";
                else
                    text += "⬛";
            }

            if (user.exportSettings.discordSpoiler) {
                const maxLen = 40;
                const paddedText = g.guessedTitle
                    .padStart(Math.floor((g.guessedTitle.length + maxLen) / 2))
                    .padEnd(maxLen);
                text += `||\`${paddedText}\`||`;
            }
            text += "\n";
        }
    }
    navigator.clipboard.writeText(text.trim());
    toast.add({severity: 'info', summary: "Sharing results", detail: "Text copied to clipboard.", life: 3000});
}
</script>

<style lang="scss" scoped>
.footer {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;

    & .next {
        font-family: 'Patua One';
        font-size: 1.2rem;
        height: 100%;

        & .time {
            font-size: 1.4rem;
        }
    }

    .buttons {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: .5rem;
    }
}
</style>