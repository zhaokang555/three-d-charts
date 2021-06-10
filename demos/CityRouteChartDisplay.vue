<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {CityRouteChart} from '../src';

    export default {
        name: "CityRouteChartDisplay",
        data() {
            return {
                chart: () => null,
            }
        },
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            this.chart = new CityRouteChart(list, this.$refs.container);
            this.chart.render();
        },
        beforeDestroy() {
            this.chart.clean();
        },
    }
</script>

<style scoped>

</style>