<script setup>
import { ref, watch } from 'vue'
import { Info, Star, Bug } from 'lucide-vue-next'

const props = defineProps(['message']);

var toasts = ref([]);

watch(() => props.message, async(message, oldMessage) => {
    toasts.value.push(message);
    var timeout = 3000;
    if(message.level == 'SUCCESS') {
        timeout = 30000;
    }
    setTimeout(() => {
        var i = toasts.value.indexOf(message);
        if(i != -1) {
            toasts.value.splice(i, 1);
        };
    }, timeout);
});

</script>

<template>
    <div class="toast-outer">
        <div class="toast" v-for="toast in toasts" @click="toasts.splice(toasts.indexOf(toast), 1)">
            <Bug class="icon" size="100%" v-if="toast.level == 'TEST'"></Bug>
            <Info class="icon" size="100%" v-if="toast.level == 'PROGRESS'"></Info>
            <Star class="icon" size="100%" v-if="toast.level == 'SUCCESS'"></Star>
            <div class="inner">
                <span class="level">== {{toast.level}}</span>
                {{toast.message}}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .toast-outer {
        position:absolute;
        top:3rem;
        left:50vw;
        z-index: 100;
        transform: translateX(-50%);
        
        display: flex;
        flex-direction: column;
        gap:1rem;
    }

    @keyframes newToast {
        from {
            top: 2rem;
        }

        to {
            top: 0rem;
        }
    }

    .toast {
        position:relative;
        padding: 1rem;
        background-color: var(--highlight-color);
        color: black;
        text-shadow: 0 0 .2rem rgba(black, 0.3);
        border-radius: .5rem;
        border: 1px black solid;
        box-shadow: 0 0 10px rgba(white, 0.7), 0 0 20px rgba(white, 0.6);
        
        cursor: pointer;
        
        animation-name: newToast;
        animation-duration: 800ms;
        animation-timing-function: ease-out;
        animation-iteration-count: 1;
        animation-fill-mode: forwards;
        
        display: flex;
        align-items: center;
        
        .icon {
            margin-right: .5rem;
            width: 2rem;
        }
        .inner {
            display: flex;
            flex-direction: column;
        }
        .level {
            font-weight:800;
        }
    }
</style>