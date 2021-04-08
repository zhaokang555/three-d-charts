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

export const highlightClickedCubeInFullWindowWithPerspectiveCamera = (event, scene, camera, defaultColor = 0xff0000) => {
    const mouseCoords = new THREE.Vector2();
    mouseCoords.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseCoords.y = - (event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseCoords, camera);

    const cubes = scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
    if (cubes.length > 0) {
        cubes.forEach(cube => cube.material.color.set(defaultColor));
        const intersects = raycaster.intersectObjects(cubes);
        if (intersects.length > 0) {
            intersects[0].object.material.color.set(0xffffff);
        }
    }
};

export const highlightHoveredCubeInFullWindowWithPerspectiveCamera = (scene, camera, defaultColor = 0xff0000) => {
    if (window.pointer) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( window.pointer, camera );

        const cubes = scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
        if (cubes.length > 0) {
            cubes.forEach(cube => cube.material.color.set(defaultColor));
            const intersects = raycaster.intersectObjects(cubes);
            if (intersects.length > 0) {
                intersects[0].object.material.color.set(0xffffff);
            }
        }
    }
};