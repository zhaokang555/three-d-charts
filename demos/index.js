import Vue from 'vue'
import DemoList from './demo-list.vue'
import SetBarChart from './set-bar-chart.vue'

Vue.component('set-bar-chart', SetBarChart);

new Vue({
    el: '#demo-list',
    render: h => h(DemoList)
});