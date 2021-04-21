import {initChinaProvinceBarChart} from '../../../src';

const list = JSON.parse(localStorage.getItem('list')) || [];
initChinaProvinceBarChart(list);
