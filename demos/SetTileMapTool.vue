<template>
    <div>
        <div>tileWidth: <input type="number" v-model="tileWidth"></div>
        <div>tileHeight: <input type="number" v-model="tileHeight"></div>
        <router-link :to="to">Generate tile map tool</router-link>
    </div>
</template>

<script>
    export default {
        name: "SetTileMapTool",
        computed: {
            to() {
                return {
                    path: '/tile-map-tool-display',
                    query: {
                        tileWidth: this.tileWidth,
                        tileHeight: this.tileHeight,
                    }
                };
            }
        },
        data() {
            return {
                tileWidth: 3600,
                tileHeight: 3600,
            }
        }
    }
</script>

<style scoped>

</style>