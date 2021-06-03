<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initScatterChart} from '../src';

    export default {
        name: "ScatterChartDisplay",
        data() {
          return {
              clean: () => null,
          }
        },
        mounted() {
            const list = JSON.parse(localStorage.getItem('list')) || [];
            this.clean = initScatterChart(list, this.$refs.container);
        },
        beforeDestroy() {
          this.clean();
        },
    }
</script>

<style scoped>

</style>