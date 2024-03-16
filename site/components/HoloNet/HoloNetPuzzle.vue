<template>
  <h2>
    <svg :style="{ fill: '#ffde00', height: '32px', 'margin-right': '.5rem' }"
      viewBox="0 0 1 1">
      <use xlink:href="/icons.svg#faction-nbn"></use>
    </svg>
    Epiphany Political Suite &ndash; Speech Writer
  </h2>

  <div class="puzzle">
    <div class="left">
      <HoloNetImage :holo-net="holoNet" :revealed="holoNet.fullReveal.value" />
      <HoloNetForm :holo-net="holoNet" v-show="!holoNet.fullReveal.value" />
    </div>
    <div class="right">
      <HoloNetHistory :holo-net="holoNet" />
    </div>
  </div>
</template>

<script setup>
const holoNet = await useHoloNet();
</script>

<style lang="scss" scoped>
.puzzle {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  align-content: flex-start;
  max-width: 70rem;
  width: 80vw;

  @media (max-width: 70rem) {
    gap: 1rem;
  }
}

h2 {
  display: flex;
  align-items: center;
  margin-left: 4rem;
}

.left,
.right {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.left {
  flex-direction: column;
  align-items: center;
  flex-grow: 3;
}

.right {
  flex-direction: column;
  justify-content: center;

  min-width: 20rem;
  max-width: 30rem;
  width: 90vw;

  @media (max-width: 70rem) {
    width: 100%;
  }
}
</style>
