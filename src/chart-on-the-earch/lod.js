import * as THREE from "three";
import Constant from '../constant';
import Algorithms from "./algorithms";
import earth_nightmap_0 from './BlackMarble_2016_01deg_3600x1800.jpeg';
const {earthRadius} = Constant;

// level 1:
// full map size = 86400x43200
// each tile size = 3600x3600
const fullMapSize = new THREE.Vector2(86400, 43200);
const tileSize = new THREE.Vector2(3600, 3600);
const colCount = 24;
const rowCount = 12;

/**
 * @param scene
 * @param camera
 */
export const getLevelAndIntersectCoordinatesByCameraPosition = (scene, camera, renderer) => {
    const earthMesh = scene.getObjectByName('earthMesh');
    if (!earthMesh) return;
    const map = earthMesh.material.map;

    const earthPosition = earthMesh.position;
    const distance = camera.position.distanceTo(earthPosition);
    if (distance > 1.5 * earthRadius) {
        // level 0
        if (map.currentLevel === 0) return;

        updateMapToLevel0(map);
    } else {
        // level 1
        const raycaster = new THREE.Raycaster();
        raycaster.set(earthPosition, camera.position.clone().normalize());
        const earthMesh = scene.getObjectByName('earthMesh');
        if (earthMesh) {
            const intersects = raycaster.intersectObject(earthMesh);
            if (intersects[0]) {
                const {point} = intersects[0];
                _updateMapToLevel1(map, renderer, ...Algorithms.getLonLatByPosition(point));
            }
        }
    }
};

/**
 * @param map: THREE.CanvasTexture
 */
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

/**
 * @param map: THREE.CanvasTexture
 * @param renderer
 * @param lon: number
 * @param lat: number
 * @private
 */
const _updateMapToLevel1 = (map, renderer, lon, lat) => {
    map.currentLevel = 1;

    const colAndRowIndexList = _getColAndRowIndexListOfLevel1ByCoordinates(lon, lat);
    const urls = colAndRowIndexList.map(([colIdx, rowIdx]) => {
        return `/tiles_level_1/tile_${colIdx}_${rowIdx}_${tileSize.x}x${tileSize.y}.jpeg`;
    });
    if (map.currentUrl === urls[4]) return;

    map.currentUrl = urls[4];
    _loadImages([earth_nightmap_0, ...urls])
        .then(([imageOfLevel0, ...imagesOfLevel1]) => {
            const canvas = map.image;
            const scale = fullMapSize.x / renderer.capabilities.maxTextureSize;
            canvas.width = fullMapSize.x / scale;
            canvas.height = fullMapSize.y / scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageOfLevel0, 0, 0, canvas.width, canvas.height);
            imagesOfLevel1.forEach((imageOfLevel1, i) => {
                const [colIdx, rowIdx] = colAndRowIndexList[i];
                ctx.drawImage(imageOfLevel1, colIdx * tileSize.x / scale, rowIdx * tileSize.y / scale,
                    tileSize.x / scale, tileSize.y / scale);
            });
            map.needsUpdate = true;
        });
};

/**
 * @param lon
 * @param lat
 * @return {Array<[number, number]>}
 */
const _getColAndRowIndexListOfLevel1ByCoordinates = (lon, lat) => {
    const scaleMatrix = new THREE.Matrix3().set(colCount / 360, 0, 0,
        0, -rowCount / 180, 0,
        0, 0, 1);
    const translateMatrix = new THREE.Matrix3().set(1, 0, colCount / 2,
        0, 1, rowCount / 2,
        0, 0, 1);
    const tileCoordinates = (new THREE.Vector2(lon, lat))
        .applyMatrix3(scaleMatrix)
        .applyMatrix3(translateMatrix);
    const colIdx = Math.min(Math.floor(tileCoordinates.x), colCount - 1);
    const rowIdx = Math.min(Math.floor(tileCoordinates.y), rowCount - 1);
    const colIdxLeft = (colIdx + colCount - 1) % colCount;
    const colIdxRight = (colIdx + 1) % colCount;
    const rowIdxTop = (rowIdx + rowCount - 1) % rowCount;
    const rowIdxBottom = (rowIdx + 1) % rowCount;

    return [
        [colIdxLeft, rowIdxTop],
        [colIdxLeft, rowIdx],
        [colIdxLeft, rowIdxBottom],
        [colIdx, rowIdxTop],
        [colIdx, rowIdx], // center tile
        [colIdx, rowIdxBottom],
        [colIdxRight, rowIdxTop],
        [colIdxRight, rowIdx],
        [colIdxRight, rowIdxBottom],
    ];
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