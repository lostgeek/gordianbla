<template>
  <div class="puzzleContainer" :class="puzzleClasses" :style="`filter: blur(${squint}px)`">
    <div
      ref="puzzle" class="puzzle"
      :class="puzzleClasses"
    />
    <div class="cardImage" :class="cardImageClasses">
      <img :src="cardUrl">
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['puzzleMode', 'revealLevel', 'cardUrl', 'cardSvg'])
// puzzleMode: one of these: [combo, triangle, rect, rectangle,
//             ellipse, circle, rotatedrect, beziers, rotatedellipse, polygon]
// revealLevel: Level (n=0-5) to be revealed after n guesses. n=6 stands for full solution
// cardUrl: URL to actual card image
// cardSvg: SVG of the gordian puzzle

const puzzle = ref(null)

const puzzleClasses = ref([])
const cardImageClasses = ref([])

onMounted(() => {
  puzzle.value.innerHTML = props.cardSvg

  nextTick(() => {
    const svgDom = puzzle.value?.children[0]

    if (!svgDom) {
      console.error('No SVG found in puzzle. props:', props)
      return
    }

    const width = svgDom.getAttribute('width')
    const height = svgDom.getAttribute('height')
    if (height) {
      svgDom.removeAttribute('width')
      svgDom.removeAttribute('height')
      // svgDom.setAttribute('width', '100%');
      svgDom.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }

    // Set all elements to hidden at first
    const elements = svgDom.children[1].children
    for (let i = 0; i < elements.length; i++)
      elements[i].className.baseVal = 'hidden'

    svgDom.children[0].className.baseVal = 'hidden'
    setTimeout(() => {
      updateSvg()
    }, 500)
  })
})

const numOfElements = {
  spoiler: [0, 5, 10, 20, 40, 80, 160, 320, 320],
  combo: [10, 20, 40, 80, 160, 320, 320],
  triangle: [10, 20, 40, 80, 160, 320, 320],
  rect: [10, 20, 40, 80, 160, 320, 320],
  rectangle: [10, 20, 40, 80, 160, 320, 320],
  ellipse: [10, 20, 40, 80, 160, 320, 320],
  circle: [20, 40, 80, 160, 320, 640, 640],
  rotatedrect: [10, 20, 40, 80, 160, 320, 320],
  beziers: [15, 30, 60, 120, 240, 400, 400],
  rotatedellipse: [10, 20, 40, 80, 160, 320, 320],
  polygon: [10, 20, 40, 80, 160, 320, 320],
}
const MAX_ANIMS = 99

function updateSvg() {
  const svgDom = puzzle.value.children[0]
  if (props.revealLevel === 0) {
    svgDom.children[0].className.baseVal = 'background hidden'
  } else if (props.revealLevel === 2) {
    svgDom.children[0].className.baseVal = 'background o-20'
  } else if (props.revealLevel === 3) {
    svgDom.children[0].className.baseVal = 'background o-40'
  } else if (props.revealLevel === 4) {
    svgDom.children[0].className.baseVal = 'background o-60'
  } else if (props.revealLevel === 5) {
    svgDom.children[0].className.baseVal = 'background o-80'
  }

  const elements = svgDom.children[1].children

  let targetElements
  if (props.revealLevel === 6) {
    svgDom.children[0].className.baseVal = 'solved shown shown-anim-0'
    targetElements = elements.length
    if (!puzzleClasses.value.includes('solved'))
      puzzleClasses.value.push('solved')

    if (!cardImageClasses.value.includes('solved'))
      cardImageClasses.value.push('solved')
  } else {
    if (puzzleClasses.value.includes('solved'))
      puzzleClasses.value = puzzleClasses.value.filter(x => (x !== 'solved'))

    if (cardImageClasses.value.includes('solved'))
      cardImageClasses.value = cardImageClasses.value.filter(x => (x !== 'solved'))
    cardImageClasses.value.push('shown')
    cardImageClasses.value.push('shown-anim-1')

    targetElements = numOfElements[props.puzzleMode][props.revealLevel]
  }

  const firstHidden = Array.from(elements).findIndex((e) => {
    return e.className.baseVal === 'hidden'
  })
  const newElements = Math.min(targetElements, elements.length) - firstHidden

  for (let i = 0; i < elements.length; i++) {
    if (i <= targetElements) {
      if (i < firstHidden) {
        elements[i].className.baseVal = 'shown'
      } else {
        const partial_anim = Math.min(Math.floor((i - firstHidden) / newElements * (MAX_ANIMS + 1)), MAX_ANIMS)
        elements[i].className.baseVal = `shown shown-anim-${partial_anim}`
      }
    } else {
      elements[i].className.baseVal = 'hidden'
    }
  }
}

watch(() => props.revealLevel, () => {
  updateSvg()
})

const squint = ref(0)
</script>

<style lang="scss">
.puzzleContainer {
    width: 100%;
    position: relative; // Needed for cardImage to be positioned absolute
    z-index: 0;

    overflow:clip;
    border-radius: 4.7% / 3.6%;

    &.solved {
        transition: filter .5s linear;
        filter: blur(0px)!important;
    }
}
.puzzle {
    width: 100%;
    visibility: visible;
    opacity: 1;
    transition: visibility 0s 2s, opacity 1s 1s linear;
    height: 100%;

    &.solved {
        visibility: hidden;
        transition: visibility 0s 2s, opacity 1s 1s linear;
        opacity: 0;
    }

    & svg {
        max-width: 100%;
        height: auto;
        vertical-align: middle;
        font-style: italic;
        background-repeat: no-repeat;
        background-size: cover;
        shape-margin: 1rem;
        & * {
            transition: visibility 0s, opacity 0.1s linear;
        }

        & .background {
            transition: opacity 0.2s linear;
        }
        & .hidden {
            visibility: hidden;
            opacity: 0;
        }
        & .o-20 {
            opacity: 0.2;
        }
        & .o-40 {
            opacity: 0.4;
        }
        & .o-60 {
            opacity: 0.6;
        }
        & .o-80 {
            opacity: 0.8;
        }

        & .shown {
            visibility: visible;
            opacity: 1;
        }

        @media not (prefers-reduced-motion) {
            @for $i from 0 through 99 {
                & .shown-anim-#{$i} {
                    transition-delay: 0.02s*$i;
                }
            }
        }
    }
}
.cardImage {
    width: 100%;
    position: absolute;
    top: 0;
    visibility: hidden;
    z-index: -1;

    & img {
        width: 100%;
        border-radius: 4.7% / 3.6%;
    }

    &.solved {
        visibility: visible;
    }
}

.sliderGroup {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    &.solved {
        visibility: hidden;
    }

    & .icon {
        font-size: 1.5rem;
    }

    & .squint {
        flex-grow: 1;
    }
}
</style>
