import Vue from 'vue'
import DemoList from './demo-list.vue'
import SetBarChart from './set-bar-chart'
import SetChinaProvinceBarChart from './set-china-province-bar-chart'

Vue.component('set-bar-chart', SetBarChart);
Vue.component('set-china-province-bar-chart', SetChinaProvinceBarChart);

new Vue({
    el: '#demo-list',
    render: h => h(DemoList)
});