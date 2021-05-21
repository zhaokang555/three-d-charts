<template>
    <div></div>
</template>

<script>
    import {tileMapTool} from '../src';

    export default {
        name: "TileMapTool",
        mounted() {
            const input = tileMapTool(2048, 2048);
            this.$el.appendChild(input)
        },
        methods: {
        }
    }
</script>

<style scoped>

</style>