import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'
import DemoList from './DemoList'
import BarChartDisplay from "./BarChartDisplay";
import BarChart2ArgsDisplay from "./BarChart2ArgsDisplay";
import ChinaProvinceBarChartDisplay from "./ChinaProvinceBarChartDisplay";
import ChinaCityRouteChartDisplay from './ChinaCityRouteChartDisplay';

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        {path: '/', component: DemoList},
        {path: '/bar-chart-display', component: BarChartDisplay},
        {path: '/bar-chart-2-args-display', component: BarChart2ArgsDisplay},
        {path: '/china-province-bar-chart-display', component: ChinaProvinceBarChartDisplay},
        {path: '/china-city-route-chart-display', component: ChinaCityRouteChartDisplay},
    ]
});

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});