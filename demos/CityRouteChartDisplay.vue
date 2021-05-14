<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initCityRouteChart} from '../src';

    export default {
        name: "CityRouteChartDisplay",
        data() {
            return {
                clean: () => null,
            }
        },
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            this.clean = initCityRouteChart(list, this.$refs.container);
        },
        beforeDestroy() {
            this.clean();
        },
    }
</script>

<style scoped>

</style>