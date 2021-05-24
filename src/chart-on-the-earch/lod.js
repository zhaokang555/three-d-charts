import * as THREE from "three";
import Constant from '../constant';
import Algorithms from "./algorithms";
import earth_nightmap_0 from './BlackMarble_2016_01deg_3600x1800.jpeg';

const {earthRadius} = Constant;

/**
 * @param scene
 * @param camera
 * @return {[number, null]|[number, [number, number]]}
 */
export const getLevelAndIntersectCoordinatesByCameraPosition = (scene, camera) => {
    const earthMesh = scene.getObjectByName('earthMesh');
    if (!earthMesh) return;
    const map = earthMesh.material.map;

    const earthPosition = new THREE.Vector3();
    const distance = camera.position.distanceTo(earthPosition);
    if (distance > 1.5 * earthRadius) {
        // level 0
        if (map.currentLevel === 0) return;

        updateMapToLevel0(map);
    } else {
        // level 1
        const raycaster = new THREE.Raycaster();
        raycaster.set(camera.position, earthPosition.clone().sub(camera.position).normalize());
        const earthMesh = scene.getObjectByName('earthMesh');
        if (earthMesh) {
            const intersects = raycaster.intersectObject(earthMesh);
            if (intersects[0]) {
                const {point} = intersects[0];
                _updateMapToLevel1(map, ...Algorithms.getLonLatByPosition(point));
            }
        }
    }
};

export const updateMapToLevel0 = map => {
    map.currentLevel = 0;
    map.currentUrl = earth_nightmap_0;
    new THREE.ImageLoader().load(earth_nightmap_0, image => {
        const canvas = map.image;
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        map.needsUpdate = true;
    });
};

const _updateMapToLevel1 = (map, lon, lat) => {
    // level 1 full map size = 13500x6750
    // each tile size = 3375x3375

    map.currentLevel = 1;
    const fullMapSize = new THREE.Vector2(13500, 6750);
    const tileSize = new THREE.Vector2(3375, 3375);

    const [colIdx, rowIdx] = _getColAndRowIndexOfLevel1ByCoordinates(lon, lat);
    const url = `/tiles_level_1/tile_${rowIdx}_${colIdx}_3375x3375.jpeg`;
    if (map.currentUrl === url) return;

    map.currentUrl = url;
    _loadImages([earth_nightmap_0, url])
        .then(([imageOfLevel0, imageOfLevel1]) => {
            const canvas = map.image;
            canvas.width = fullMapSize.x;
            canvas.height = fullMapSize.y;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageOfLevel0, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(imageOfLevel1, colIdx * tileSize.x, rowIdx * tileSize.y);
            map.needsUpdate = true;
        });
};

const _getTileMeshOfLevel1ByCoordinates = (lon, lat) => {
    const [colIdx, rowIdx] = _getColAndRowIndexOfLevel1ByCoordinates(lon, lat);
    const phiLength = Math.PI / 2;
    const thetaLength = Math.PI / 2;
    const phiStart = -Math.PI / 2 + phiLength * colIdx;
    const thetaStart = thetaLength * rowIdx;

    const geometry = new THREE.SphereGeometry(earthRadius, 32, 32,
        phiStart, phiLength, thetaStart, thetaLength);

    const loader = new THREE.TextureLoader();
    const map = loader.load(`/tiles_level_1/tile_${rowIdx}_${colIdx}_3375x3375.jpeg`);
    const specularMap = loader.load(`/tiles_specular_level_1/tile_${rowIdx}_${colIdx}_2048x2048.jpeg`);
    const material = new THREE.MeshPhongMaterial({
        map,
        specularMap, // 镜面反射贴图
        specular: '#808080',
        shininess: 22,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
};

/**
 * @param lon
 * @param lat
 * @return {[number, number]} colIdx = 0, 1, 2, 3; rowIdx = 0, 1;
 */
const _getColAndRowIndexOfLevel1ByCoordinates = (lon, lat) => {
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

/**
 * @param urls: Array<string>
 */
const _loadImages = (urls) => {
    const promises = urls.map(url => {
        return new Promise(resolve => {
            new THREE.ImageLoader().load(url, image => resolve(image));
        });
    });
    return Promise.all(promises);
};