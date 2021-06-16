import IList from '../type/IList';
import IPosition from '../type/IPosition';
import { BarMesh } from './BarMesh';
import { TextMesh } from './TextMesh';

export const getBarWidthByValues = (values: Array<number>): number => {
    let barWidth = values.reduce((sum, val) => sum + val, 0) / values.length;
    const minValue = Math.min(...values);
    if (minValue / barWidth < 0.1) {
        barWidth = minValue * 10;
    }
    return barWidth;
};

export const getBarWidthByLists = (lists: Array<IList>): number => {
    let sum = 0;
    let count = 0;
    lists.forEach(list => {
        list.forEach(kv => {
            sum += kv.value;
            count += 1;
        });
    });
    return sum / count;
};

export const getMaxAndMinValueByLists = (lists: Array<IList>): [number, number] => {
    let maxValue = -Infinity;
    let minValue = Infinity;
    lists.forEach(list => list.forEach(kv => {
        maxValue = Math.max(maxValue, kv.value);
        minValue = Math.min(minValue, kv.value);
    }));
    return [maxValue, minValue];
};

/**
 * @param n
 * @param value
 * @param barWidth
 * @param baseLineIndex 第几排柱子
 */
export const getPositionOfNthBar = (n: number, value: number, barWidth: number, baseLineIndex: number = 0): IPosition => {
    const barGap = barWidth * 0.4; // 柱子之间的间隔距离

    return [
        n * barGap + barWidth * (2 * n + 1) / 2,
        value / 2, // 柱子y坐标 = 柱子高度/2
        -(barWidth + barGap) * baseLineIndex - (barWidth / 2), // 这排柱子的z坐标 = 0 - 排距*第几排 - 柱宽/2
    ]
};

export const getPositionOfKeyOnTopByBar = (bar: BarMesh, valueMesh: TextMesh, keyMesh: TextMesh): IPosition => {

    return [
        bar.position.x,
        bar.height + valueMesh.height + keyMesh.height * 1.5,
        bar.position.z
    ];
};

export const getPositionOfValueByBar = (bar: BarMesh, valueMesh: TextMesh): IPosition => {
    return [
        bar.position.x,
        bar.height + valueMesh.height,
        bar.position.z
    ];
};
