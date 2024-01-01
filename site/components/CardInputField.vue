<template>
    <form @submit.prevent="guess">
        <InputGroup>
            <AutoComplete ref="titleInput" v-model="selectedCard" optionLabel="stripped_title" :suggestions="suggestions"
                @complete="autocomplete" placeholder="Enter card name" :delay="200" forceSelection>
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

const props = defineProps(['nrdb', 'gordian']);

const titleInput = ref(null);

var uniqueCards = [];
var uniqueTitles = [];
props.nrdb.cards.forEach(c => {
    // Filter TD alternate cards
    if (c.pack_code == 'tdc') {
        var parts = c.title.split(" ");
        c.stripped_title = parts.filter(p => !['2', '3', '4', 'A', 'B'].includes(p)).join(' ');
    }

    if (uniqueTitles.includes(c.stripped_title)) {
        return;
    }

    uniqueTitles.push(c.stripped_title);
    uniqueCards.push(c);
});

const options = {
    shouldSort: true,
    includeMatches: true,
    keys: ['title', 'stripped_title']
}

const fuse = new Fuse(uniqueCards, options);
const suggestions = ref([]);

const selectedCard = ref("");
const autocomplete = (event) => {
    var results = fuse.search(event.query);
    // include matches in card data
    suggestions.value = results.map(el => {
        var card = el.item;
        card.matches = el.matches;
        return card;
    });
};

async function guess() {
    if (!selectedCard.value) {
        return;
    }
    const card = selectedCard.value;
    selectedCard.value = null;
    await props.gordian.guess(card);
}

// Adapted from https://github.com/primefaces/primevue/blob/master/components/lib/autocomplete/AutoComplete.vue#L618
function customOnEnterKey(event) {
    if (this.overlayVisible) {
        if (this.focusedOptionIndex !== -1) {
            this.onOptionSelect(event, this.visibleOptions[this.focusedOptionIndex]);
        }

        this.hide();
        event.preventDefault();
    }
}

onMounted(() => {
    titleInput.value.onEnterKey = customOnEnterKey;
});
</script>