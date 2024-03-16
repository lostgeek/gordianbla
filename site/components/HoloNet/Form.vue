<script setup>
const { holoNet } = defineProps(['holoNet']);

const word = ref("");

function submit(e) {
  e.preventDefault();
  var sanitised = word.value;
  word.value = "";

  sanitised = sanitised.replace(/\s/g, '');
  if (sanitised != "")
    holoNet.guess(sanitised);
}
</script>

<template>
  <InputGroup class="group">
    <InputText v-model="word" placeholder="Enter possible speech continuation" pattern="[^\s]+" title="Only single words" @keyup.enter="submit" />
    <Button label="Run simulation" severity="warning" @click="submit" />
  </InputGroup>
</template>

<style lang="scss" scoped>
.group {
  padding: 1rem;
}
</style>
