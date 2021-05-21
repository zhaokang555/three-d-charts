import * as THREE from "three";
import Constant from '../constant';

const {earthRadius} = Constant;

export const getLevelByDistance = (scene, camera) => {
    const earthPosition = new THREE.Vector3();
    const distance = camera.position.distanceTo(earthPosition);
    console.log(distance);
    if (distance > 1.5 * earthRadius) {
        // todo
    } else {
        const raycaster = new THREE.Raycaster();
        raycaster.set(camera.position, earthPosition.clone().sub(camera.position).normalize());
        const earthMesh = scene.getObjectByName('earthMesh');
        if (earthMesh) {
            const intersects = raycaster.intersectObject(earthMesh);
            if (intersects[0]) {
                const {point, uv} = intersects[0];
                console.log(point, uv);
                // todo
            }
        }
    }
};

export const getTilePathOfLevel1ByCoordinates = (lon, lat) => {
    const scaleMatrix = new THREE.Matrix3().set(4 / 360, 0, 0,
        0, -2 / 180, 0,
        0, 0, 1);
    const translateMatrix = new THREE.Matrix3().set(1, 0, 2,
        0, 1, 1,
        0, 0, 1);
    const tileCoordinates = (new THREE.Vector2(lon, lat))
        .applyMatrix3(scaleMatrix)
        .applyMatrix3(translateMatrix);
    const colIdx = Math.min(Math.floor(tileCoordinates.x), 3);
    const lineIdx = Math.min(Math.floor(tileCoordinates.y), 2);

    const tilePath = `/tiles_level_1/tile_${lineIdx}_${colIdx}_3375x3375.jpeg`;
    return tilePath;
};