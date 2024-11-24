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
  <div
    v-if="user.squintMode" v-tooltip.left="'Squinting strength'" class="sliderGroup"
    :class="puzzleClasses"
  >
    <EyeIcon :squint="squint" />
    <Slider
      id="squint" v-model="squint"
      class="squint"
      :min="0" :max="10" :step=".2"
    />
  </div>
</template>

<script setup>
const props = defineProps(['puzzleMode', 'revealLevel', 'cardUrl', 'cardSvg'])
// puzzleMode: one of these: [combo, triangle, rect, rectangle,
//             ellipse, circle, rotatedrect, beziers, rotatedellipse, polygon]
// revealLevel: Level (n=0-5) to be revealed after n guesses. n=6 stands for full solution
// cardUrl: URL to actual card image
// cardSvg: SVG of the gordian puzzle

const user = useUser()

const puzzle = ref(null)

const puzzleClasses = ref([])
const cardImageClasses = ref([])

onMounted(() => {
  puzzle.value.innerHTML = props.cardSvg

  const svgDom = puzzle.value.children[0]

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

  setTimeout(() => {
    updateSvg()
  }, 500)
})

const numOfElements = {
  combo: [10, 20, 40, 80, 160, 320, 320],
  triangle: [10, 20, 40, 80, 160, 320, 320],
  rect: [10, 20, 40, 80, 160, 320, 320],
  rectangle: [10, 20, 40, 80, 160, 320, 320],
  ellipse: [10, 20, 40, 80, 160, 320, 320],
  circle: [20, 40, 80, 160, 320, 640, 640],
  rotatedrect: [10, 20, 40, 80, 160, 320, 320],
  beziers: [10, 20, 40, 80, 160, 320, 320],
  rotatedellipse: [10, 20, 40, 80, 160, 320, 320],
  polygon: [10, 20, 40, 80, 160, 320, 320],
}
const MAX_ANIMS = 99

function updateSvg() {
  const svgDom = puzzle.value.children[0]

  const elements = svgDom.children[1].children

  let targetElements
  if (props.revealLevel === 6) {
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

        & .hidden {
            visibility: hidden;
            opacity: 0;
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
