import * as Utils from "./Utils";

/**
 * @param values: Array<number>
 * @return {number}
 */
export const getCubeWidthByValues = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;

/**
 * @param lists: Array<Array<{
 *     key: string;
 *     value: string;
 * }>>
 * * @return {number}
 */
export const getCubeWidthByLists = (lists) => {
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

/**
 * @param lists: Array<Array<{
 *     key: string;
 *     value: string;
 * }>>
 * * @return {[number, number]}
 */
export const getKeyAndValueMaxLength = (lists) => {
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

/**
 * @param lists: Array<Array<{
 *     key: string;
 *     value: string;
 * }>>
 * * @return {[number, number]}
 */
export const getMaxAndMinValueByLists = (lists) => {
    let maxValue = 0;
    let minValue = 0;
    lists.forEach(list => list.forEach(kv => {
        maxValue = Math.max(maxValue, kv.value);
        minValue = Math.min(minValue, kv.value);
    }));
    return [maxValue, minValue];
};

/**
 * @param n: number
 * @param value: number
 * @param cubeWidth: number
 * @param baseLineIndex: number 第几排柱子
 * @return {[number, number, number]}
 */
export const getPositionOfNthBar = (n, value, cubeWidth, baseLineIndex = 0) => {
    const cubeGap = cubeWidth * 0.4; // 柱子之间的间隔距离

    return [
        n * cubeGap + cubeWidth * (2 * n + 1) / 2,
        value / 2, // 柱子y坐标 = 柱子高度/2
        -(cubeWidth + cubeGap) * baseLineIndex - (cubeWidth / 2), // 这排柱子的z坐标 = 0 - 排距*第几排 - 柱宽/2
    ]
};

/**
 * @param cube: THREE.Mesh
 * @param cubeWidth
 * @param offsetY: number
 * @param offsetZ: number
 * @return {[number, number, number]}
 */
export const getPositionOfKeyByCube = (cube, cubeWidth, offsetY, offsetZ) => {
    return [
        cube.position.x,
        offsetY,
        cube.position.z + cubeWidth / 2 + offsetZ
    ];
};

export const getPositionOfKeyOnTopByCube = (cube, offsetY) => {
    return [
        cube.position.x,
        Utils.getValueByCube(cube) + offsetY,
        cube.position.z
    ];
};

/**
 * @param cube: THREE.Mesh
 * @return {[number, number, number]}
 */
export const getPositionOfValueByCube = (cube) => {
    return [
        cube.position.x,
        Utils.getValueByCube(cube),
        cube.position.z
    ]
};
