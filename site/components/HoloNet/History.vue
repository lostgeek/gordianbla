<template>
  <Panel header="Simulation history">
    <div class="scroll">
      <ul>
        <li v-for="item in history.slice().reverse()" :class="[item.type]">
          <span v-if="item.type == 'guess'" class="guess">
            <span class="guessed-word">
              {{ item.word }}
            </span><br />
            <span class="result" :class="[item.level]">{{ item.message }}</span>
          </span>
          <span v-if="item.type == 'message'" class="message">
            <span class="message-level">
              == {{ item.level }} ==
            </span><br />
            {{ item.message }}
          </span>
          <div v-if="item.type == 'reveal'" class="reveal">
            <span class="reveal success">
            {{ item.message }}
            </span>
            <Button
              severity="success"
              v-if="item.type == 'reveal'"
              :label="(holoNet.fullReveal.value) ? 'Hide full results' : 'Reveal full results'"
              @click="holoNet.fullReveal.value = !holoNet.fullReveal.value"
              />
          </div>
        </li>
      </ul>
    </div>
  </Panel>
</template>

<script setup>
const { holoNet } = defineProps(['holoNet']);

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
}

const history = ref([]);

function generateMessage(hits) {
  if (hits == 0) {
    return [
      'Prediction: Strong public discontent.',
      'Prediction: Increased protest activity.',
      'Conflict: Unwanted publicity on protected politician.',
      'Error: Bribery limits exceeded.',
      'Logic check: Contradiction with previous statement too obvious.',
      'Alert: Suspected interference from rival corporation.',
    ].sample();
  } else if (hits == 1) {
    return [
      "Prediction: Moderate reaction anticipated.",
      "Analysis: Slight deviation from expected trajectory.",
      "Projection: Marginal influence on overall strategy.",
    ].sample();
  } else if (hits <= 3) {
    return [
      "Forecast: Enhanced leverage in upcoming negotations.",
      "Trend: Multiple indicators positive.",
      "Result: Weak points in opposition strategy revealed.",
    ].sample();
  } else {
    return [
      "Prediction: Public opinion decisively swayed in our favour.",
      "Evaluation: Overwhelming support for the initiative in the parliament.",
      "Assessment: Transition to stage 3 possible two months ahead of schedule.",
    ].sample();
  }
}

watch(() => holoNet.guesses.value.length, () => {
  var level;
  let guess = holoNet.guesses.value[holoNet.guesses.value.length - 1];

  if (guess.hits === null) {
    history.value.push({ 'type': 'guess', 'word': guess.word, 'hits': 0, 'level': "repeat", 'message': "Topic already covered." });
    return;
  }

  if (guess.hits == 0) {
    level = 'miss';
  } else if (guess.hits == 1) {
    level = 'hit';
  } else {
    level = 'success';
  }

  history.value.push({ 'type': 'guess', 'word': guess.word, 'hits': guess.hits, 'level': level, 'message': generateMessage(guess.hits) });
});

let level = 0;
watch(() => holoNet.percentageRules.value, (percentageRules) => {
  if (level == 0 && percentageRules > 0.15) {
    history.value.push({ 'type': 'message', 'level': "PROGRESS", 'message': "Prognosticating slight shift in alignment with our initiative. Further opinion making necessary." });
    level++;
  }
  if (level == 1 && percentageRules > 0.35) {
    history.value.push({ 'type': 'message', 'level': "PROGRESS", 'message': "Likelihood of yes votes from both greens and yellows above 65%. Message needs wider appeal." });
    level++;
  }
  if (level == 2 && percentageRules > .65) {
    history.value.push({ 'type': 'message', 'level': "PROGRESS", 'message': "Agreement across political parties likely. Success probability: 73.8%" });
    level++;
  }
  if (level == 3 && percentageRules > .85) {
    history.value.push({ 'type': 'reveal', 'level': "SUCCESS", 'message': "Initiative now 99.7% certain to pass parliament. Full report available." });
  }
})
</script>

<style lang="scss" scoped>
:deep(.p-panel) {
  width: 100%;
}

:deep(.p-panel-content) {
  width: 100%;
  height: 60vh;
  overflow-y: auto;
}

ul {
  margin: 0;
  padding: 0;
  padding-left: 0rem;

  li {
    list-style-type: none;
    line-height: 1.1;
    padding-bottom: .75rem;
    padding-left: 1rem;
    --highlight-color-numbers: 255, 255, 255;
    color: rgb(var(--highlight-color-numbers));

    &.message {
      text-align: center;
      padding-left: 0;
    }
  }
}

span.guessed-word {
  font-weight: 700;
  word-wrap: break-all;
  white-space: normal;
}

span.result {
  margin-left: 2rem;
  word-wrap: break-all;
  white-space: normal;
}

span.message {
  font-weight: 400;
  --highlight-color-numbers: 44, 255, 244;
}

span.miss {
  --highlight-color-numbers: 255, 87, 57;
}

span.hit {
  --highlight-color-numbers: 255, 252, 92;
}

span.success {
  --highlight-color-numbers: 103, 255, 33;
}

span.repeat {
  --highlight-color-numbers: 0, 255, 234;
}

span.message,
span.miss,
span.hit,
span.success,
span.repeat {
  color: rgb(var(--highlight-color-numbers));
}

span.message-level {
  font-weight: 800;
  font-size: 110%
}

div.reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  color: rgb(var(--highlight-color-numbers));
  & span {
    font-size: 120%;
  }
}
</style>
