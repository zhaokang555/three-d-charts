import {initBarChart2Args} from '../../../src';

const lists = JSON.parse(localStorage.getItem('lists')) || [];
initBarChart2Args(lists);