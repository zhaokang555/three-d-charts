<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initCityRouteChart} from '../src';

    export default {
        name: "CityRouteChartDisplay",
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            initCityRouteChart(list, this.$refs.container);
        }
    }
</script>

<style scoped>

</style>