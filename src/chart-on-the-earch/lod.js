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

/**
 * @param lon
 * @param lat
 * @return {[number, number]} colIdx = 0, 1, 2, 3; rowIdx = 0, 1;
 */
export const getColAndRowIndexOfLevel1ByCoordinates = (lon, lat) => {
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
    const rowIdx = Math.min(Math.floor(tileCoordinates.y), 2);

    return [colIdx, rowIdx];
};

export const getTileMeshOfLevel1ByCoordinates = (lon, lat) => {
    const [colIdx, rowIdx] = getColAndRowIndexOfLevel1ByCoordinates(lon, lat);
    const phiLength = Math.PI / 2;
    const thetaLength = Math.PI / 2;
    const phiStart = -Math.PI / 2 + phiLength * colIdx;
    const thetaStart = thetaLength * rowIdx;

    const geometry = new THREE.SphereGeometry(earthRadius, 32, 32,
        phiStart, phiLength, thetaStart, thetaLength);

    const loader = new THREE.TextureLoader();
    const map = loader.load(`/tiles_level_1/tile_${rowIdx}_${colIdx}_3375x3375.jpeg`);
    const specularMap = loader.load(`/tiles_specular_level_1/tile_${rowIdx}_${colIdx}_2048x2048.jpeg`);
    const material = new THREE.MeshPhongMaterial( {
        map,
        specularMap, // 镜面反射贴图
        specular: '#808080',
        shininess: 22,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
};