<template>
  <div id="svgImage" ref="svgImage" v-show="!revealed"></div>
  <div id="spoilerImage" v-show="revealed"><img src="~/assets/LIB_RWR_48.png" /></div>
</template>

<script setup>
const { holoNet, revealed } = defineProps(['holoNet', 'revealed']);

const svgImage = ref();
const gordian = ref([]);
const words = ref([]);

onMounted(() => {
  let svgDOM = holoNet.svgDOM.value;
  let gordian_tmp = svgDOM.children[0];
  let words_tmp = Array.from(svgDOM.children).slice(1);
  Array.from(words_tmp).forEach(el => {
    el.classList.add("hidden");
  });

  Array.from(gordian_tmp.children).forEach(el => {
    el.classList.add("hidden");
  });

  words_tmp[0].classList.replace("hidden", "shown")

  gordian_tmp.children[0].classList.replace("hidden", "shown");

  svgImage.value.innerHTML = svgDOM.outerHTML;

  gordian.value = svgImage.value.children[0].children[0];
  words.value = Array.from(svgImage.value.children[0].children).slice(1).reverse();
  setTimeout(updateShapes, 500);
  setTimeout(revealInterpunction, 2000);
})

function revealInterpunction() {
  let count = 0;
  words.value.forEach(el => {
    var w_id = el.getAttribute('id');
    if (el.getAttribute('serif:id') != null) {
      w_id = el.getAttribute('serif:id');
    }

    if ([".", ",", "-", ":", "\"", "Kingmaking"].includes(w_id)) {
      el.classList.replace("hidden", "shown-anim-"+Math.floor(count/15*10));
      count++;
    }
  });
}

watch(() => holoNet.guesses.value.length, () => {
  let word = holoNet.guesses.value[holoNet.guesses.value.length - 1].word;

  let localHits = 0;
  Array.from(words.value).forEach(w => {
    var w_id = w.getAttribute('id');
    if (w.getAttribute('serif:id') != null) {
      w_id = w.getAttribute('serif:id');
    }

    if (!w_id) {
      return;
    }

    if (word.toLowerCase() == w_id.toLowerCase()) {
      if (!w.classList.contains("shown")) {
        w.classList.replace("hidden", "shown");
        w.classList.add("shown-anim-" + localHits);
        localHits++;
      }
    }
  });

  updateShapes();
})

function updateShapes() {
  var n = 6;

  n += holoNet.realHits.value * 2;

  var prevLimit = -1;
  for (var i = 0; i <= n; i++) {
    if (gordian.value.children[i].classList.contains("shown")) {
      gordian.value.children[i].classList.remove("shown-anim-0", "shown-anim-1", "shown-anim-2", "shown-anim-3", "shown-anim-4", "shown-anim-5", "shown-anim-6", "shown-anim-7", "shown-anim-8", "shown-anim-9");
    } else {
      if (prevLimit < 0) {
        prevLimit = i;
      }
      gordian.value.children[i].classList.replace("hidden", "shown");
      const newlyShownElements = n - prevLimit;
      const currElement = i - prevLimit;
      if (newlyShownElements > 10)
        gordian.value.children[i].classList.add("shown-anim-" + Math.floor(currElement / newlyShownElements * 10));
      else
        gordian.value.children[i].classList.add("shown-anim-" + currElement);
    }
  }
}

</script>

<style lang="scss">
#svgImage,
#spoilerImage {
  max-width: 30rem;
  max-height: 80vh;
  width: 40vw;

  @media (max-width: 70rem) {
    width: 50vw;
    max-width: 100%;
    max-height: 60vh;
  }

  z-index: 10;
  display:flex;
  justify-content: center;
}

#spoilerImage img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  border-radius: 20px;
  outline: 2px black solid;
  box-shadow: 0 0 5px rgba(var(--highlight-color-numbers), 0.8), 0 0 10px rgba(var(--highlight-color-numbers), 0.7), 0 0 15px rgba(var(--highlight-color-numbers), 0.6), 0 0 20px rgba(var(--background-color-numbers), 0.8), 0 0 20px rgba(var(--background-color-numbers), 0.8);
}

#svgImage svg {
  width: auto;
  height: auto;
  border-radius: 20px;
  outline: 2px black solid;
  box-shadow: 0 0 5px rgba(var(--highlight-color-numbers), 0.8), 0 0 10px rgba(var(--highlight-color-numbers), 0.7), 0 0 15px rgba(var(--highlight-color-numbers), 0.6), 0 0 20px rgba(var(--background-color-numbers), 0.8), 0 0 20px rgba(var(--background-color-numbers), 0.8);

  & * {
    transition: visibility 0s, opacity 0.1s linear;
  }

  & .hidden {
    visibility: hidden;
    opacity: 0;
  }

  & .shown {
    visibility: visible;
    opacity: 1;
  }

  @for $i from 0 through 9 {
    & .shown-anim-#{$i} {
      transition-delay: $i * 0.2s;
    }
  }
}
</style>
