import Utils from "./utils";

export default class Algorithms {
    /**
     * @param values: Array<number>
     * @return {number}
     */
    static getCubeWidthByValues = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;

    /**
     * @param lists: Array<Array<{
     *     key: string;
     *     value: string;
     * }>>
     * * @return {number}
     */
    static getCubeWidthByLists = (lists) => {
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
    static getKeyAndValueMaxLength = (lists) => {
        let keyMaxlength = 0;
        let valueMaxlength = 0;
        lists.forEach(list => {
            list.forEach(kv => {
                const keyLen = kv.key.length;
                const valueLen = kv.value.toString().length;

                keyMaxlength = Math.max(keyMaxlength, keyLen);
                valueMaxlength = Math.max(valueMaxlength, valueLen);
            });
        });

        return [keyMaxlength, valueMaxlength];
    };

    /**
     * @param lists: Array<Array<{
     *     key: string;
     *     value: string;
     * }>>
     * * @return {[number, number]}
     */
    static getMaxAndMinValueByLists = (lists) => {
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
    static getPositionOfNthBar = (n, value, cubeWidth, baseLineIndex = 0) => {
        const cubeGap = cubeWidth * 0.4;
        const baseLine = 0 - (cubeWidth + cubeGap) * baseLineIndex - (cubeWidth / 2);
        return [
            n * cubeGap + cubeWidth * (2 * n + 1) / 2,
            value / 2,
            baseLine,
        ]
    };

    /**
     * @param cube: THREE.Mesh
     * @param cubeWidth
     * @param offsetY: number
     * @param offsetZ: number
     * @return {[number, number, number]}
     */
    static getPositionOfKeyByCube = (cube, cubeWidth, offsetY, offsetZ) => {
        return [
            cube.position.x,
            offsetY,
            cube.position.z + cubeWidth / 2 + offsetZ
        ];
    };

    static getPositionOfKeyOnTopByCube = (cube, offsetY) => {
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
    static getPositionOfValueByCube = (cube) => {
        return [
            cube.position.x,
            Utils.getValueByCube(cube),
            cube.position.z
        ]
    };
};