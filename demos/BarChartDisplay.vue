<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initBarChart} from '../src';

    export default {
        name: "BarChartDisplay",
        data() {
          return {
              clean: () => null,
          }
        },
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            this.clean = initBarChart(list, this.$refs.container);
        },
        beforeDestroy() {
          this.clean();
        },
    }
</script>

<style scoped>

</style>