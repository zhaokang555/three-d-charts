<template>
    <div>
        <h1>Demos</h1>

        <h2>Demo 1: Bar chart</h2>
        <h3>2020年中国各省GDP</h3>
        <set-bar-chart></set-bar-chart>

        <h2>Demo 2: Bar chart with 2 arguments</h2>
        <h3>中国各省近几年GDP</h3>
        <set-bar-chart-2-args></set-bar-chart-2-args>

        <h2>Demo 3: China province bar chart</h2>
        <h3>2020年中国各省GDP</h3>
        <set-china-province-bar-chart></set-china-province-bar-chart>

        <h2>Demo 4: City route chart</h2>
        <set-city-route-chart></set-city-route-chart>

        <h2>Demo 5: Tile map tool</h2>
        <router-link to="/tile-map-tool">Tile map tool</router-link>
    </div>
</template>

<script>
    import SetBarChart from './SetBarChart'
    import SetBarChart2Args from './SetBarChart2Args'
    import SetChinaProvinceBarChart from './SetChinaProvinceBarChart'
    import SetCityRouteChart from "./SetCityRouteChart";

    export default {
        name: "DemoList",
        components: {
            'set-bar-chart': SetBarChart,
            'set-bar-chart-2-args': SetBarChart2Args,
            'set-china-province-bar-chart': SetChinaProvinceBarChart,
            'set-city-route-chart': SetCityRouteChart,
        }
    }
</script>

<style scoped>

</style>