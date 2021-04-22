export default class BarChartAlgorithms {
    /**
     * @param values: Array<number>
     * @return {number}
     */
    static getCubeWidthByValues = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;

    /**
     * @param n: number
     * @param value: number
     * @param cubeWidth: number
     * @return {[number, number, number]}
     */
    static getPositionOfNthBar = (n, value, cubeWidth) => {
        const cubeGap = cubeWidth * 0.4;
        return [
            n * cubeGap + cubeWidth * (2 * n + 1) / 2,
            value / 2,
            0 - (cubeWidth / 2)
        ]
    };

    /**
     * @param n: number
     * @param cubeWidth: number
     * @param fontDepth: number
     * @param offset: number
     * @return {[number, number, number]}
     */
    static getPositionOfNthKey = (n, cubeWidth, fontDepth, offset) => {
        const cubeGap = cubeWidth * 0.4;
        return [
            n * cubeGap + cubeWidth * n + offset,
            0,
            fontDepth
        ];
    };

    /**
     * @param cube: THREE.Mesh
     * @param offsetX: number
     * @param offsetY: number
     * @param offsetZ: number
     * @return {[number, number, number]}
     */
    static getPositionOfKeyByCube = (cube, offsetX, offsetY, offsetZ) => {
        return [
            cube.position.x + offsetX,
            offsetY,
            offsetZ
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