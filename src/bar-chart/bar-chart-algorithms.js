export default class BarChartAlgorithms {
    static getCubeWidthByValues = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;

    static getPositionOfNthBar = (n, value, cubeWidth) => {
        const cubeGap = cubeWidth * 0.4;
        return [
            n * cubeGap + cubeWidth * (2 * n + 1) / 2,
            value / 2,
            0 - (cubeWidth / 2)
        ]
    };

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
     * @param offsetZ: number
     */
    static getPositionOfKeyByCube = (cube, offsetX, offsetZ) => {
        return [
            cube.position.x + offsetX,
            0,
            offsetZ
        ];
    };

    static getPositionOfValueByCube = (cube, offsetX) => {
        cube.geometry.computeBoundingBox();
        const boundingBox = cube.geometry.boundingBox;
        // const cubeWidth = boundingBox.max.x - boundingBox.min.x;
        const value = boundingBox.max.y - boundingBox.min.y;

        return [
            cube.position.x + offsetX,
            value,
            cube.position.z
        ]
    };

};