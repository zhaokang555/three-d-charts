<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initBarChart} from '../src';

    export default {
        name: "BarChartDisplay",
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            initBarChart(list, this.$refs.container);
        }
    }
</script>

<style scoped>

</style>