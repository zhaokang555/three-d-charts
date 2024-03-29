import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'
import DemoList from './DemoList'
import BarChartDisplay from "./BarChartDisplay";
import BarChart2ArgsDisplay from "./BarChart2ArgsDisplay";
import ChinaProvinceBarChartDisplay from "./ChinaProvinceBarChartDisplay";
import CityRouteChartDisplay from './CityRouteChartDisplay';
import ScatterChartDisplay from './ScatterChartDisplay';
import TileMapToolDisplay from './TileMapToolDisplay';

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        {path: '/', component: DemoList},
        {path: '/bar-chart-display', component: BarChartDisplay},
        {path: '/bar-chart-2-args-display', component: BarChart2ArgsDisplay},
        {path: '/china-province-bar-chart-display', component: ChinaProvinceBarChartDisplay},
        {path: '/city-route-chart-display', component: CityRouteChartDisplay},
        {path: '/scatter-chart-display', component: ScatterChartDisplay},
        {path: '/tile-map-tool-display', component: TileMapToolDisplay},
    ]
});

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});