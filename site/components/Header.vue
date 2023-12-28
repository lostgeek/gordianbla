<template>
    <div class='header'>
        Gordian Blade
        <div class='buttons right'>
            <Button v-tooltip.bottom="'RSS'" icon="fa-solid fa-rss" size="large" text />
            <Button v-tooltip.bottom="'Rules'" icon="fa-solid fa-scale-balanced" size="large" text />
            <Button v-tooltip.bottom="'Share'" icon="fa-solid fa-share-nodes" size="large" text />
            <Button v-tooltip.bottom="'Settings'" icon="fa-solid fa-gears" size="large" text />
            <Button v-tooltip.bottom="'About'" icon="fa-solid fa-circle-info" size="large" text />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.header {
    padding: .5rem 0;

    font-size: 2rem;
    font-family: 'Patua One', Arial;
    text-align: center;


    & .buttons {
        &.right {
            display: inline;
            position: absolute;
            right: 0;
            margin-right: 1rem;
        }

        Button {
        }
    }
}

a>.material-symbols-outlined {
    color: var(--text-color);
}
</style>