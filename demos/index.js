import Vue from 'vue'
import DemoList from './demo-list.vue'
import SetBarChart from './set-bar-chart'
import SetBarChart2Args from './set-bar-chart-2-args'
import SetChinaProvinceBarChart from './set-china-province-bar-chart'

Vue.component('set-bar-chart', SetBarChart);
Vue.component('set-bar-chart-2-args', SetBarChart2Args);
Vue.component('set-china-province-bar-chart', SetChinaProvinceBarChart);

new Vue({
    el: '#demo-list',
    render: h => h(DemoList)
});