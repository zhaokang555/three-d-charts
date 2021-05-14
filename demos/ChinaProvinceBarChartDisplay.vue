<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initChinaProvinceBarChart} from '../src';

    export default {
        name: "ChinaProvinceBarChartDisplay",
        data() {
            return {
                clean: () => null,
            }
        },
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            this.clean = initChinaProvinceBarChart(list, this.$refs.container);
        },
        beforeDestroy() {
            this.clean();
        },
    }
</script>

<style scoped>

</style>