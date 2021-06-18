<template>
    <div></div>
</template>

<script>
    import { tileMapTool } from '../src';

    export default {
        name: "TileMapTool",
        mounted() {
            let {tileWidth, tileHeight} = this.$route.query;
            tileWidth = parseInt(tileWidth || '3600');
            tileHeight = parseInt(tileHeight || '3600');
            const input = tileMapTool(tileWidth, tileHeight);
            this.$el.appendChild(input)
        },
    }
</script>

<style scoped>

</style>