<script setup>
import { ref, watch } from 'vue'
Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}

const props = defineProps(['hits']);
const emit = defineEmits(['reveal', 'toast']);

const history = ref([]);

function generateMessage(hits) {
    if(hits == 0) {
        return ["ERROR #42c9@d87", "Datastream interrupted!", "No crypographic match.", "Access denied!"].sample();
    } else if(hits == 1) {
        return ["Partial hit.", "Match found.", "Singularity locked."].sample();
    } else if(hits <= 3) {
        return ["Decryption layer cracked.", "Partial overlap found."].sample();
    } else {
        return ["Signature overlap in "+hits+" sectors detected."].sample();
    }
}

var totalHits = ref(0);
var decryptionLevel = 0;

watch(() => props.hits, async([word, hits, percentage], old) => {
    var level;
    if(hits == 0) {
        level = 'miss';
    } else if(hits == 1) {
        level = 'hit';
    } else {
        level = 'success';
    }

    if(history.value.map((el) => el.word).includes(word)) {
        history.value.push({'type':'guess','word':word, 'hits':0, 'level':"repeat", 'message':"Cypher already attempted."});
    } else {
        history.value.push({'type':'guess','word':word, 'hits':hits, 'level':level, 'message':generateMessage(hits)});
    }

    if(! [".",",","-",":","\""].includes(word.toLowerCase())) {
        totalHits.value += hits;
    }

    /*
    if(word == "toast") {
        emit('toast', {'type':'message', 'level': "TEST", 'message':"Hello, World!"});
    }
    */

    /*
    if(word == "solve") {
        var message = {'type':'message', 'level': "SUCCESS", 'message':"Abracadabra"};
        history.value.push(message);
        emit('toast', message);
    }
    */

    if(decryptionLevel == 0 && percentage >= 0.25) {
        decryptionLevel++;
        var message = {'type':'message', 'level': "PROGRESS", 'message':"First decryption layer broken."};
        history.value.push(message);
        emit('toast', message);
    }
    if(decryptionLevel == 1 && percentage >= 0.5) {
        decryptionLevel++;
        var message = {'type':'message', 'level': "PROGRESS", 'message':"Inner decryption layer reached."};
        history.value.push(message);
        emit('toast', message);
    }
    if(decryptionLevel == 2 && percentage >= 0.85) {
        decryptionLevel++;
        var message = {'type':'message', 'level': "SUCCESS", 'message':"Decryption broken."}
        history.value.push(message);
        emit('toast', message);
    }
});

</script>

<template>
    <div class="box">
        <h1>Attempted cyphers</h1>
        <div class="scroll">
            <ul>
                <li v-for="item in history.slice().reverse()" :class="[item.type]">
                    <span v-if="item.type == 'guess'" class="guess"><span class="guessed-word">&gt; {{item.word}}</span><br /><span class="result" :class="[item.level]">{{item.message}}</span></span>
                    <span v-if="item.type == 'message'" class="message"><span class="message-level">== {{item.level}} ==</span><br />{{item.message}}<span v-if="item.level == 'SUCCESS'"><br />Reveal decrypted datastream?<br><a @click="emit('reveal',true)">YES</a> / <a @click="emit('reveal',false)">NO</a></span></span>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.box {
    width:100%;
    //outline: 1px solid var(--highlight-color);
    //outline-offset: -.75rem;
    border:1px black solid;
    border-radius: 1rem;
    background: var(--background-color);
    box-shadow: 0 0 5px rgba(var(--highlight-color-numbers), 0.8), 0 0 10px rgba(var(--highlight-color-numbers), 0.7), 0 0 15px rgba(var(--highlight-color-numbers), 0.6), 0 0 20px rgba(var(--background-color-numbers), 0.8), 0 0 20px rgba(var(--background-color-numbers), 0.8);
    max-height: 30rem;
    display:flex;
    flex-direction:column;
    min-height: 10rem;
}

h1 {
    font-size:120%;
    font-weight:900;
    margin:0;
    padding-top: 1rem;
    padding-left: 3rem;
    --highlight-color-numbers: 255,255,255;
    text-shadow: 0 0 .4rem rgba(var(--highlight-color-numbers), 0.6);
}

.scroll {
    padding-top: 1.5rem;
    padding-left: 0rem;
    flex-shrink:1;
    min-height:1rem;
    overflow-y:auto;
}
ul {
    margin: 0;
    padding: 0;
    padding-left: 0rem;

    li {
        list-style-type:none;
        line-height:1.1;
        padding-bottom:.75rem;
        padding-left: 1rem;
        --highlight-color-numbers: 255,255,255;
        color: rgb(var(--highlight-color-numbers));
        text-shadow: 0 0 .6rem rgba(var(--highlight-color-numbers), 0.5), 0 0 .4rem rgba(var(--highlight-color-numbers), 0.3);
        &.message {
            text-align:center;
            padding-left:0;
        }
    }
}

span.guessed-word {
    font-weight:700;
    word-wrap:break-all;
    white-space:normal;
}

span.result {
    margin-left: 2rem;
    word-wrap:break-all;
    white-space:normal;
}
span.message {
    font-weight: 400;
    --highlight-color-numbers: 44, 255, 244;
}
span.miss {
    --highlight-color-numbers: 255, 87, 57;
}
span.hit {
    --highlight-color-numbers: 255, 252, 92;
}
span.success {
    --highlight-color-numbers: 103, 255, 33;
}
span.repeat {
    --highlight-color-numbers: 0, 255, 234;
}
span.message,span.miss,span.hit,span.success,span.repeat {
    color: rgb(var(--highlight-color-numbers));
    text-shadow: 0 0 .8rem rgba(var(--highlight-color-numbers), 0.8), 0 0 .4rem rgba(var(--highlight-color-numbers), 0.5);
}

span.message-level {
    font-weight:800;
    font-size:110%
}

</style>
