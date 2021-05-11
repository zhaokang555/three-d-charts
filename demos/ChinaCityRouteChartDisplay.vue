<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initChinaCityRouteChart} from '../src';

    export default {
        name: "ChinaCityRouteChartDisplay",
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            initChinaCityRouteChart(list, this.$refs.container);
        }
    }
</script>

<style scoped>

</style>