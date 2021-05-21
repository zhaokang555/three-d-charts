<template>
    <div></div>
</template>

<script>
    import {tileMapTool} from '../src';

    export default {
        name: "TileMapTool",
        mounted() {
            let {tileWidth, tileHeight} = this.$route.query;
            tileWidth = parseInt(tileWidth || '1000');
            tileHeight = parseInt(tileHeight || '1000');
            const input = tileMapTool(tileWidth, tileHeight);
            this.$el.appendChild(input)
        },
        methods: {
        }
    }
</script>

<style scoped>

</style>