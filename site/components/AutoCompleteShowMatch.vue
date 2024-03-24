<template>
  <span v-for="(group, index) in groups" :key="index" :class="group.class">
    {{ group.text }}
  </span>
</template>

<script setup>
const props = defineProps(['match'])

const text = props.match.value
const groups = ref([])
let i = 0
let indices = props.match.indices
while (i < text.length) {
  if (indices.length > 0) {
    const start = indices[0][0]
    const end = indices[0][1]
    indices = indices.slice(1)

    if (i < start)
      groups.value.push({ text: text.slice(i, start), class: null })

    groups.value.push({ text: text.slice(start, end + 1), class: 'match' })
    i = end + 1
  } else {
    groups.value.push({ text: text.slice(i), class: null })
    i += text.slice(i).length
  }
}
</script>

<style lang="scss" scoped>
.match {
    color: var(--highlight-text-color);
    background-color: var(--highlight-bg);
    border-radius: 3px;
}
</style>
