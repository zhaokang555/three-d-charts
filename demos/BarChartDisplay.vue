<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {BarChart} from '../src';

    export default {
        name: "BarChartDisplay",
        data() {
            return {
                chart: null,
            }
        },
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            this.chart = new BarChart(list, this.$refs.container);
            this.chart.render();
        },
        beforeDestroy() {
            this.chart.clean();
        },
    }
</script>

<style scoped>

</style>