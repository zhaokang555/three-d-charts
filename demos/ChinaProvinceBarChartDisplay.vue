<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {ChinaProvinceBarChart} from '../src';

    export default {
        name: "ChinaProvinceBarChartDisplay",
        data() {
            return {
                chart: null,
            }
        },
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            this.chart = new ChinaProvinceBarChart(list, this.$refs.container);
            this.chart.render();
        },
        beforeDestroy() {
            this.chart.clean();
        },
    }
</script>

<style scoped>

</style>