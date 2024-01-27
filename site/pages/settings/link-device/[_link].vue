<template>
    Linking account.
</template>

<script setup>
const toast = useToast();
const user = useUser();

onMounted(async () => {
    if (user.accountInfo) {
        toast.add({
            severity: 'error',
            summary: "Linking device",
            detail: "Already linked to an account."
        });
        navigateTo('/settings');
    }

    try {
        await user.fetchUserFromInvite(useRoute().params._link);
        useTrackEvent('link_device');
        toast.add({
            severity: 'success',
            summary: "Linking device",
            detail: "Account was successfully linked."
        });
    } catch (e) {
        if(e.status == 410) {
            toast.add({
                severity: 'error',
                summary: "Linking device",
                detail: "Link expired"
            });
        } else if(e.status == 401) {
            toast.add({
                severity: 'error',
                summary: "Linking device",
                detail: "Link invalid"
            });
        } else {
            toast.add({
                severity: 'error',
                summary: "Linking device",
                detail: e.message
            });
        }
    }
    navigateTo('/settings');
});

</script>