<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initChinaProvinceBarChart} from '../src';

    export default {
        name: "ChinaProvinceBarChartDisplay",
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            initChinaProvinceBarChart(list, this.$refs.container);
        }
    }
</script>

<style scoped>

</style>