import IList from '../type/IList';
import IPosition from '../type/IPosition';
import { BarMesh } from '../components/BarMesh';

export const getBarWidthByValues = (values: Array<number>): number => values.reduce((sum, val) => sum + val, 0) / values.length;

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

export const getKeyAndValueMaxLength = (lists: Array<IList>): [number, number] => {
    let keyMaxlength = 0;
    let valueMaxlength = 0;
    lists.forEach(list => list.forEach(kv => {
        const keyLen = kv.key.length;
        const valueLen = kv.value.toString().length;

        keyMaxlength = Math.max(keyMaxlength, keyLen);
        valueMaxlength = Math.max(valueMaxlength, valueLen);
    }));

    return [keyMaxlength, valueMaxlength];
};

export const getMaxAndMinValueByLists = (lists: Array<IList>): [number, number] => {
    let maxValue = 0;
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
    const cubeGap = barWidth * 0.4; // 柱子之间的间隔距离

    return [
        n * cubeGap + barWidth * (2 * n + 1) / 2,
        value / 2, // 柱子y坐标 = 柱子高度/2
        -(barWidth + cubeGap) * baseLineIndex - (barWidth / 2), // 这排柱子的z坐标 = 0 - 排距*第几排 - 柱宽/2
    ]
};

export const getPositionOfKeyOnTopByCube = (cube: BarMesh, offsetY: number): IPosition => {
    return [
        cube.position.x,
        cube.height + offsetY,
        cube.position.z
    ];
};

export const getPositionOfValueByCube = (cube: BarMesh): IPosition => {
    return [
        cube.position.x,
        cube.height,
        cube.position.z
    ];
};
