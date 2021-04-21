import {initBarChart} from '../../../src';

const list = JSON.parse(localStorage.getItem('list')) || [];
initBarChart(list);