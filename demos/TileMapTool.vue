<template>
    <div></div>
</template>

<script>
    import {tileMapTool} from '../src';

    export default {
        name: "TileMapTool",
        mounted() {
            const input = tileMapTool(3375, 3375);
            this.$el.appendChild(input)
        },
        methods: {
        }
    }
</script>

<style scoped>

</style>