<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {BarChart2Args} from '../src';

    export default {
        name: "BarChart2ArgsDisplay",
        data() {
            return {
                chart: null,
            }
        },
        mounted() {
            const lists = JSON.parse(localStorage.getItem('lists')) || [];
            this.chart = new BarChart2Args(lists, this.$refs.container);
            this.chart.render();
        },
        beforeDestroy() {
            this.chart.clean();
        },
    }
</script>

<style scoped>

</style>