<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initScatterChart} from '../src';

    const randomRange = 0.4;
    const {pow, cos, PI, random} = Math;

    export default {
        name: "ScatterChartDisplay",
        data() {
            return {
                clean: () => null,
            }
        },
        mounted() {
            const list = this.mockData();
            this.clean = initScatterChart(list, this.$refs.container);
        },
        beforeDestroy() {
            this.clean();
        },
        methods: {
            mockData() {
                const vertices = [];
                for (let x = -3; x < 7; x += 0.05) {
                    const y = 0.1 * pow(x, 3) - 0.5 * pow(x, 2) - 0.7 * x;

                    const maxOffset = randomRange / 2 * 1.733;
                    const x2 = cos(PI / 4) * (x + 3 + maxOffset); // translateX(3) rotateOnWorldAxis(new Vector3(0, 1, 0), PI / 4)
                    vertices.push([x2 + this.random(), y + 6 + this.random(), x2 + this.random()]);
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