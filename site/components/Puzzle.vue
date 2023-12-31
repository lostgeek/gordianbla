<script setup>
const props = defineProps(['nrdb', 'gordian']);

const puzzleContainer = ref(null);

onMounted(() => {
    puzzleContainer.value.innerHTML = props.gordian.cardSvg;

    const svgDom = puzzleContainer.value.children[0];

    var width = svgDom.getAttribute('width');
    var height = svgDom.getAttribute('height');
    if(height) {
        svgDom.removeAttribute('width');
        svgDom.removeAttribute('height');
        svgDom.setAttribute('width', '100%');
        svgDom.setAttribute('viewBox', '0 0 '+width+' '+height);
    }

    // Set all elements to hidden at first
    var elements = svgDom.children[1].children;
    for (var i = 0; i < elements.length; i++) {
        elements[i].className.baseVal = "hidden";
    }

    setTimeout(() => {updateSvg()}, 500);
})

const numOfElements = {
    'combo':            [10, 20, 40, 80, 160, 320, 320],
    'triangle':         [10, 20, 40, 80, 160, 320, 320],
    'rect':             [10, 20, 40, 80, 160, 320, 320],
    'rectangle':        [10, 20, 40, 80, 160, 320, 320],
    'ellipse':          [10, 20, 40, 80, 160, 320, 320],
    'circle':           [20, 40, 80, 160, 320, 640, 640],
    'rotatedrect':      [10, 20, 40, 80, 160, 320, 320],
    'beziers':          [100, 200, 400, 800, 1600, 3200, 3200], // slight lie... there only are 1500
    'rotatedellipse':   [10, 20, 40, 80, 160, 320, 320],
    'polygon':          [10, 20, 40, 80, 160, 320, 320],
};
const MAX_ANIMS = 99;

function updateSvg() {
    const svgDom = puzzleContainer.value.children[0];

    var elements = svgDom.children[1].children;

    var targetElements;
    if (props.gordian.solved) {
        targetElements = elements.length;
    } else {
        targetElements = numOfElements[props.gordian.puzzleAttr.mode][props.gordian.currentGuess];
    }

    var firstHidden = Array.from(elements).findIndex(function (e) { return e.className.baseVal == "hidden"; });
    var newElements = Math.min(targetElements, elements.length) - firstHidden;

    for (var i = 0; i < elements.length; i++) {
        if (i <= targetElements) {
            if (i < firstHidden) {
                elements[i].className.baseVal = "shown";
            } else {
                const partial_anim = Math.min(Math.floor((i - firstHidden) / newElements * (MAX_ANIMS + 1)), MAX_ANIMS);
                elements[i].className.baseVal = "shown shown-anim-" + partial_anim;
            }
        } else {
            elements[i].className.baseVal = "hidden";
        }
    }
}

watch(props.gordian.guesses, (newGuesses, oldGuesses) => {
    updateSvg();
});
</script>

<template>
    <div class="puzzleContainer" ref="puzzleContainer">
    </div>
</template>

<style lang="scss">
.puzzleContainer {
    width: 100%;

    & svg {
        border-radius: 4.7% / 3.6%;
        
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

        @for $i from 0 through 99 {
            & .shown-anim-#{$i} {
                transition-delay: 0.02s*$i;
            }
        }
    }
}
</style>