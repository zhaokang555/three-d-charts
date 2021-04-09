export const getCubeWidthByValues = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;

export const getPositionOfNthBar = (n, value, cubeWidth) => {
    const cubeGap = cubeWidth * 0.4;
    return [
        n * cubeGap + cubeWidth * (2 * n + 1) / 2,
        value / 2,
        0 - (cubeWidth / 2)
    ]
};

export const getPositionOfNthKey = (n, cubeWidth, fontDepth) => {
    const cubeGap = cubeWidth * 0.4;
    return [
        n * cubeGap + cubeWidth * n,
        0,
        fontDepth
    ];
};

export const highlightCubeInFullWindowWithPerspectiveCamera = (scene, camera, raycaster, pointer, defaultColor = 0xff0000) => {
    raycaster.setFromCamera( pointer, camera );

    const cubes = scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
    if (cubes.length > 0) {
        cubes.forEach(cube => cube.material.color.set(defaultColor));
        const intersects = raycaster.intersectObjects(cubes, true);
        if (intersects.length > 0) {
            intersects[0].object.material.color.set(0xffffff);
        }
    }
};