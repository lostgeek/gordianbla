<script setup>
import { ref, watch } from 'vue'
import svgUrl from '../assets/spoiler_separated.svg'

const props = defineProps(['word', 'revealed']);
const emit = defineEmits(['hits']);

const svgImage = ref(null);

var words = ref(null);
var gordian = ref(null);
var subs = ref(null);

watch(() => props.word, async(word, oldWord) => {
    var hits = 0;
    Array.from(words.value).forEach(w => {
        var w_id = w.getAttribute('id');
        if(w.getAttribute('serif:id') != null) {
            w_id = w.getAttribute('serif:id');
        }
        
        if(word.toLowerCase() == w_id.toLowerCase()) {
            if(!w.classList.contains("shown")) {
                w.classList.replace("hidden","shown");
                w.classList.add("shown-anim-"+hits);
                hits++;
            }
        }
    });
    if(["sub", "subroutine"].includes(word.toLowerCase())) {
        Array.from(subs.value).forEach((el) => {
            el.classList.replace("hidden", "shown");
        });
        hits += 3;
    }

    const indices = [0, 2, 3, 5, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 47, 48, 49, 51, 52, 53, 54, 55, 56, 57, 58, 60, 61, 62, 63, 64, 65, 66, 67, 68, 78, 79];
    var all = indices.map(idx => words.value[idx]);
    var shown = all.filter(el => el.classList.contains("shown"));

    emit('hits', word, hits, shown.length/all.length);
    updateShapes();
});

function updateShapes() {
    var n = 8;
    
    n += Array.from(words.value).filter(el => {return el.classList.contains("shown");}).length*2;

    var prevLimit = -1;
    for(var i = 0; i <= n; i++) {
        if(gordian.value.children[i].classList.contains("shown")) {
            gordian.value.children[i].classList.remove("shown-anim-0", "shown-anim-1", "shown-anim-2", "shown-anim-3", "shown-anim-4", "shown-anim-5", "shown-anim-6", "shown-anim-7", "shown-anim-8", "shown-anim-9");
        } else {
            if(prevLimit < 0)  {
                prevLimit = i;
            }
            gordian.value.children[i].classList.replace("hidden", "shown");
            const newlyShownElements = n-prevLimit;
            const currElement = i-prevLimit;
            if(newlyShownElements > 10)
                gordian.value.children[i].classList.add("shown-anim-" + Math.floor(currElement / newlyShownElements * 10));
            else
                gordian.value.children[i].classList.add("shown-anim-" + currElement);
        }
    }

    var slices = [[29,40],[41,46],[47,50]];

    slices.forEach((slice, i) => {
        if(Array.from(words.value).slice(...slice).filter(el => el.classList.contains("shown")).length > 0) {
            subs.value[i].classList.replace("hidden", "shown");
        }
    });
}

fetch(svgUrl)
    .then((response) => response.text())
    .then((text) => {
        var parser = new DOMParser();
        var svg = parser.parseFromString(text, "text/xml");
        
        var svgDOM = svg.children[0];

        gordian = ref(svgDOM.children[0]);
        words = ref(svgDOM.children[1].children);
        subs = ref(svgDOM.children[2].children);
        Array.from(words.value).concat(Array.from(subs.value)).forEach(el => {
            el.classList.add("hidden");
        });

        Array.from(gordian.value.children).forEach(el => {
            el.classList.add("hidden");
        });

        gordian.value.children[0].classList.replace("hidden", "shown");

        svgDOM.children[3].classList.add("hidden");
        svgDOM.children[4].classList.add("hidden");

        svgImage.value.innerHTML = svgDOM.outerHTML;

        gordian = ref(svgImage.value.children[0].children[0]);
        words = ref(svgImage.value.children[0].children[1].children);
        subs = ref(svgImage.value.children[0].children[2].children);

        setTimeout(() => {updateShapes()}, 500);
        setTimeout(() => {
            svgImage.value.children[0].children[3].classList.replace("hidden", "shown");
            svgImage.value.children[0].children[4].classList.replace("hidden", "shown");
        }, 2500);
        
    });
</script>

<template>
    <div id="svgImage" ref="svgImage" v-show="!props.revealed"></div>
    <div id="spoilerImage" v-show="props.revealed"><img src="/spoiler.jpg"/></div>
</template>

<style lang="scss">
#svgImage,#spoilerImage {
    max-width: 30rem;
    max-height: 80vh;
    width: 40vw;
    @media (max-width: 70rem) {
        width: 50vw;
        max-width:100%;
        max-height: 60vh;
    }
    z-index: 10;
    display:flex;
    justify-content: center;
}

#spoilerImage img {
    width:auto;
    height:auto;
    max-width: 100%;
    max-height: 100%;
    border-radius: 20px;
    outline: 2px black solid;
    box-shadow: 0 0 5px rgba(var(--highlight-color-numbers), 0.8), 0 0 10px rgba(var(--highlight-color-numbers), 0.7), 0 0 15px rgba(var(--highlight-color-numbers), 0.6), 0 0 20px rgba(var(--background-color-numbers), 0.8), 0 0 20px rgba(var(--background-color-numbers), 0.8);
}

#svgImage svg {
    width:auto;
    height:auto;
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