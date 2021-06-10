<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {ScatterChart} from '../src';

    const randomRange = 0.4;
    const {pow, cos, PI, random, sin} = Math;

    export default {
        name: "ScatterChartDisplay",
        data() {
            return {
                chart: null,
            }
        },
        mounted() {
            const list = this.mockData();
            this.chart = new ScatterChart(list, this.$refs.container);
            this.chart.render();
        },
        beforeDestroy() {
            this.chart.clean();
        },
        methods: {
            mockData() {
                const vertices = [];
                for (let x = -2; x < 7; x += 0.04) {
                    const y = 0.1 * pow(x, 3) - 0.5 * pow(x, 2) - 0.7 * x;

                    const maxOffset = randomRange / 2 * 1.733;
                    const x2 = x + 3 + maxOffset;
                    const x3 = cos(PI / 6) * x2; // translateX(3) rotateOnWorldAxis(new Vector3(0, 1, 0), PI / 4)
                    const z3 = sin(PI / 6) * x2;
                    vertices.push([x3 + this.random(), y + 6 + this.random(), z3 + this.random()]);
                }
                return vertices;
            },
            random() {
                return random() * randomRange - randomRange / 2;
            }
        },
    }
</script>

<style scoped>

</style>