import {initBarChart2Args} from '../../../src';

const list = JSON.parse(localStorage.getItem('list')) || [];
initBarChart2Args(list);