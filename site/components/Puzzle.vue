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

})
</script>

<template>
    <div class="puzzleContainer" ref="puzzleContainer">
    </div>
</template>

<style lang="scss">
    .puzzleContainer {
        width: 100%;

        & svg {
            border-radius: 4.7% / 3.6% ;
        }
    }
</style>