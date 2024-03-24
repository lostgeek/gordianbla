<template>
  <div class="link">
    <Card>
      <template #title>
        Link account
      </template>
      <template #content>
        <div class="content">
          <div>
            Link this device to your account?
          </div>
          <InlineMessage v-if="user.playedAnyGame" class="message" severity="warn">
            This will overwrite local game history. You will lose all stats you collected on this device.
          </InlineMessage>
        </div>
      </template>
      <template #footer>
        <div class="footer">
          <Button
            label="Connect account"
            severity="success"
            icon="fa-solid fa-link"
            @click="connect"
          />
          <Button
            label="Cancel"
            severity="danger"
            icon="fa-solid fa-ban"
            @click="navigateTo('settings')"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
const toast = useToast()
const user = useUser()

onMounted(async () => {
  if (user.accountInfo) {
    toast.add({
      severity: 'error',
      summary: 'Linking device',
      detail: 'Already linked to an account.',
    })
    navigateTo('/settings')
  }
})

async function connect() {
  try {
    await user.fetchUserFromInvite(useRoute().params._link)
    useTrackEvent('link_device')
    toast.add({
      severity: 'success',
      summary: 'Linking device',
      detail: 'Account was successfully linked.',
    })
  } catch (e) {
    if (e.status === 410) {
      toast.add({
        severity: 'error',
        summary: 'Linking device',
        detail: 'Link expired',
      })
    } else if (e.status === 401) {
      toast.add({
        severity: 'error',
        summary: 'Linking device',
        detail: 'Link invalid',
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Linking device',
        detail: e.message,
      })
    }
  }
  navigateTo('/settings')
}
</script>

<style lang="scss" scoped>
.link {
    max-width: 40rem;
    width: 70vw;
    margin: 0 auto;

    @media(max-width:400px) {
        width: 100%;
    }
}

.content {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
.footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}
</style>
