<template>
    <div class="about">
        <h1>About</h1>
        <p>
            This site was created by lostgeek.
        </p>
        <p>
            Find the code over on <i class="fa-brands fa-github"></i>&nbsp;<a href="https://github.com/lostgeek/gordianbla" target="_blank">github</a>.
        </p>
        <p>
            Image creation done using the <a href="https://github.com/fogleman/primitive" target="_blank">primitive</a> library
            by fogleman.
        </p>
        <p>
            Icons by <a href="https://fontawesome.com" target="_blank">Font Awesome</a>.
        </p>
        <p>
            The information presented on this site about Android: Netrunner, both literal and graphical, is copyrighted by
            Fantasy Flight Games and/or Wizards of the Coast or Null Signal Games.
            This website is not produced, endorsed, supported, or affiliated with Fantasy Flight Games and/or Wizards of the
            Coast.
        </p>
    </div>
</template>

<script setup>
useSeoMeta({
  title: "Gordian Blade - About",
  ogTitle: "Gordian Blade - About",
  description: 'The daily Netrunner puzzle!',
  ogDescription: 'The daily Netrunner puzzle!',
  ogImage: 'https://gordianbla.de/android-chrome-192x192.png',
  twitterCard: 'summary_large_image',
})
</script>

<style lang="scss" scoped>
.about {
    max-width: 40rem;
    width: 70vw;
    margin: 0 auto;

    @media(max-width:400px) {
        width: 100%;
    }
}
</style>