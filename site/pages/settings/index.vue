<template>
    <div class="settings">
        <h1>Settings</h1>
        <div class="switch-group">
            <InputSwitch id="lightMode" v-model="user.lightMode" />
            <label for="lightMode">Light mode<div class="explanation">For when you need a flashlight shining on your face</div></label>
            <InputSwitch id="reducedMotion" v-model="reducedMotion" disabled />
            <label for="reducedMotion">Reduced motion<div class="explanation">This option is set via your operating system. See <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion" target="_blank">here</a> for more information.</div></label>
            <InputSwitch id="squintMode" v-model="user.squintMode" />
            <label for="squintMode">Squinting mode<div class="explanation">Adds slider beneath card to blur the card</div></label>
        </div>
        <Panel header="Account synchronisation" toggleable :collapsed="false">
            <template v-if="!user.accountInfo">
                <p>
                    By default, gordianbla.de saves your account data only locally in your browser.
                    You can create an account on the server to synchronise your history across multiple devices and gain access to the leaderboards (coming soon).
                </p>
                <Button label="Create account" icon="fa-solid fa-user-plus" @click="createUser"></Button>
            </template>
            <template v-else>
                <Button v-if="!invite" label="Connect other device" icon="fa-solid fa-link" @click="createInvite"></Button>
                <div v-else class="qrcode">
                    <img :src="qrcode" alt="QR Code to link mobile device" />
                    <div class="inviteLink"><a @click="copyInviteLinkToClipboard">Invite Link</a> (click to copy)</div>
                    <div v-if="expiration" class="expiration">Expires in {{expiration}}.</div>
                </div>
            </template>
        </Panel>
        <Panel class="statistics" header="Edit Eternal statistics" toggleable :collapsed="true"
            :pt="{
                content: {
                    style: 'display:flex; flex-direction:column; gap: 2rem;'
                }
            }">
            <div v-if="user.importedStats.played == 0"><Button icon="fa-solid fa-download" label="Import old stats" @click="importOldStats()" /></div>
            <div v-if="!oathSworn"><p>I declare on my honour that I will never use my powers for cheating.</p><Button icon="fa-solid fa-scroll" label="Swear oath" @click="oathSworn=true"/></div>
            <div>
                <Statistics :editable="oathSworn" format="eternal" />
                <Button style="margin-top: 1rem" v-if="oathSworn" label="Save changes"
                    @click="saveChanges(['offsetStats'])"
                    icon="fa-solid fa-save" />
            </div>
        </Panel>
    </div>
</template>

<script setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'

const user = useUser();
await user.fetchUser();

const toast = useToast();

const oathSworn = ref(false);

function importOldStats() {
    if(user.importOldStats()) {
        toast.add({
            severity: 'success',
            summary: "Import old stats",
            detail: "Old stats found and successfully imported."
        });
    } else {
        toast.add({
            severity: 'error',
            summary: "Import old stats",
            detail: "No old stats found."
        });
    }
}

watch(() => user.lightMode, (newV, oldV) =>{
    location.reload(); 
});

const reducedMotion = computed(() => (window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true));

async function saveChanges(fields) {
    await user.updateUser(fields);
    toast.add({
        severity: 'success',
        summary: "Account",
        detail: "Changes saved.",
        life: 3000,
    });
}

async function createUser() {
    if (user.accountInfo) {
        toast.add({
            severity: 'error',
            summary: "Account creation",
            detail: "An account already exists.",
        });
        return;
    }
    try {
        await user.createUser();
        useTrackEvent('create_account');
    } catch (e) {
        console.log("createUser:", e);
        toast.add({
            severity: 'error',
            summary: "Account creation",
            detail: "Could not create account. Please try again later.",
        });
    }
}

const invite = ref(null);
var host;
if (process.server) {
    host = nuxtApp.ssrContext.event.node.req.headers.origin;
} else {
    host = window.location.origin;
}
const inviteLink = computed(() => (invite.value) ? `${origin}/settings/link-device/${invite.value.link}` : null);
const qrcode = useQRCode(inviteLink);
const expiration = ref(null)

async function createInvite() {
    if (!user.accountInfo) {
        toast.add({
            severity: 'error',
            summary: "Invite creation",
            detail: "No account found",
        });
        return;
    }
    try {
        invite.value = await user.createInvite();
        useTrackEvent('create_invite');
    } catch (e) {
        console.log("createUser:", e);
        toast.add({
            severity: 'error',
            summary: "Invite creation",
            detail: "Could not create invite. Please try again later.",
        });
    }
    
    function generateExpirationString () {
        if(invite.value) {
            const diff = invite.value.expiration - new Date();

            if (diff < 0) {
                // invite expired
                invite.value = null;
                clearInterval(inviteInt);
            }

            var out = [];
            const minutes = Math.floor(diff / 1000 / 60);
            const seconds = Math.floor(diff / 1000 % 60);

            if (minutes > 0) {
                out.push(`${minutes} min`);
            }
            if (seconds > 0) {
                out.push(`${seconds} sec`);
            }

            expiration.value = out.join(' ');
        }
    }
    const inviteInt = setInterval(generateExpirationString, 1000);
    generateExpirationString();
}

function copyInviteLinkToClipboard() {
    if(!inviteLink.value) {
        return;
    }
    navigator.clipboard.writeText(inviteLink.value); 
    toast.add({
        severity: 'success',
        summary: "Invite Link",
        detail: "Copied to clipboard",
        life: 3000,
    });
}
</script>

<style lang="scss" scoped>
.settings {
    max-width: 40rem;
    width: 70vw;
    margin: 0 auto;

    @media(max-width:400px) {
        width: 100%;
    }

    &>div:not(:first-child) {
        margin-top: 1rem;
    }
}

.switch-group {
    display: grid;
    grid-template-columns: min-content 1fr;
    align-items: center;
    gap: 1rem;

    & label {
        font-size: 1.2rem;
        .explanation {
            font-size: 0.9rem;
        }
    }
}

.qrcode {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 20rem;

    & img {
        margin-bottom: .5rem;
    }

    & .expiration {
        font-size:0.8rem;
    }
}
</style>