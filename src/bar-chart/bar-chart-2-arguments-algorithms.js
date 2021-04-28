export default class BarChart2ArgumentsAlgorithms {
    static getPositionOfKeyByCube = (cube, cubeWidth) => {
        return [
            cube.position.x - cubeWidth / 2,
            cube.position.y * 2,
            cube.position.z + cubeWidth / 2,
        ];
    };
};