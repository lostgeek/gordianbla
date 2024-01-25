<template>
    Linking account.
</template>

<script setup>
const toast = useToast();
const user = useUser();

onMounted(async () => {
    try {
        await user.fetchUserFromInvite(useRoute().params._link);
        toast.add({
            severity: 'success',
            summary: "Linking device",
            detail: "Account was successfully linked."
        });
        // navigateTo('/');
    } catch ({ name, message }) {
        toast.add({
            severity: 'error',
            summary: name,
            detail: message
        });
    }
});

</script>