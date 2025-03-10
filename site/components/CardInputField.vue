<template>
  <form @submit.prevent="guess">
    <InputGroup>
      <AutoComplete
        ref="titleInput" v-model="selectedCard"
        :virtual-scroller-options="{ itemSize: 38 }"
        option-label="stripped_title" :suggestions="suggestions"
        placeholder="Enter card name" :delay="200" force-selection @complete="autocomplete"
      >
        <template #option="slotProps">
          <AutoCompleteShowMatch :match="slotProps.option.matches[0]" />
        </template>
      </AutoComplete>
      <Button type="submit" label="Submit" />
    </InputGroup>
  </form>
</template>

<script setup>
import Fuse from 'fuse.js'

const props = defineProps(['cards'])
const emit = defineEmits(['submit'])

const titleInput = ref(null)

const uniqueCards = []
const uniqueTitles = []
props.cards.forEach((c) => {
  // Filter TD alternate cards
  if (c.pack_code === 'tdc') {
    const parts = c.title.split(' ')
    c.stripped_title = parts.filter(p => !['2', '3', '4', 'A', 'B'].includes(p)).join(' ')
  }

  if (uniqueTitles.includes(c.stripped_title))
    return

  uniqueTitles.push(c.stripped_title)
  uniqueCards.push(c)
})

const options = {
  shouldSort: true,
  includeMatches: true,
  keys: ['title', 'stripped_title'],
}

const fuse = new Fuse(uniqueCards, options)
const suggestions = ref([])

const selectedCard = ref('')
function autocomplete(event) {
  // include matches in card data
  const tmp = fuse.search(event.query)
  const res = tmp.map((el) => {
    const card = {
      ...el.item,
      matches: el.matches,
    }
    return card
  })
  suggestions.value = res
}

function guess() {
  if (!selectedCard.value)
    return

  const card = selectedCard.value
  selectedCard.value = null
  emit('submit', card)
}

// Adapted from https://github.com/primefaces/primevue/blob/master/components/lib/autocomplete/AutoComplete.vue#L618
function customOnEnterKey(event) {
  if (this.overlayVisible) {
    if (this.focusedOptionIndex !== -1)
      this.onOptionSelect(event, this.visibleOptions[this.focusedOptionIndex])

    this.hide()
    event.preventDefault()
  }
}

onMounted(() => {
  titleInput.value.onEnterKey = customOnEnterKey
})
</script>
