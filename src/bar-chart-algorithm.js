export const getCubeWidthByValues = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;

export const getPositionOfNthBar = (n, value, cubeWidth) => {
    const cubeGap = cubeWidth / 5;
    return [
        (2 * n + 1) * cubeGap + cubeWidth * (2 * n + 1) / 2,
        value / 2,
        0 - (cubeWidth / 2 + cubeGap)
    ]
};