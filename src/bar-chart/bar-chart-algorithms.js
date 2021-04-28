export default class BarChartAlgorithms {
    /**
     * @param values: Array<number>
     * @return {number}
     */
    static getCubeWidthByValues = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;

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
     * @param offsetX: number
     * @param offsetY: number
     * @param offsetZ: number
     * @return {[number, number, number]}
     */
    static getPositionOfKeyByCube = (cube, cubeWidth, offsetX, offsetY, offsetZ) => {
        return [
            cube.position.x + offsetX,
            offsetY,
            cube.position.z + cubeWidth /2 + offsetZ
        ];
    };

    static getPositionOfKeyOnTopByCube = (cube, cubeWidth) => {
        return [
            cube.position.x - cubeWidth / 2,
            cube.position.y * 2,
            cube.position.z + cubeWidth / 2,
        ];
    };

    /**
     * @param cube: THREE.Mesh
     * @param offsetX: number
     * @return {[number, number, number]}
     */
    static getPositionOfValueByCube = (cube, offsetX) => {
        // 计算当前几何体的的边界矩形，更新cube.geometry.boundingBox
        // 边界矩形不会默认计算，默认为null
        cube.geometry.computeBoundingBox();
        const boundingBox = cube.geometry.boundingBox;
        const value = boundingBox.max.y - boundingBox.min.y; // value = cube height

        return [
            cube.position.x + offsetX,
            value,
            cube.position.z
        ]
    };

};