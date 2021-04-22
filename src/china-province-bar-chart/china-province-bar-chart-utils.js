import * as THREE from "three";
import earth_daymap from './8k_earth_daymap.jpeg';
import earth_nightmap from './8k_earth_nightmap.jpeg';
import earth_specular_map from './8k_earth_specular_map.png';
import earth_clouds from './8k_earth_clouds.png';
import china_geojson from "./china-geojson";
import ChinaProvinceBarChartAlgorithms from "./china-province-bar-chart-algorithms";
import Constant from "../constant";
import colormap from 'colormap';

const {earthRadius, defaultCubeColorRed, barAltitude, cloudAltitude} = Constant;

export default class ChinaProvinceBarChartUtils {
    static addLightToScene = (scene) => {
        const light = new THREE.DirectionalLight(Constant.defaultLightColorWhite, 0.7);
        light.position.set(-0.5, 0.5, -2);

        scene.add(light);
        scene.add(new THREE.AmbientLight(Constant.defaultLightColorWhite, 0.7));
    };

    static getPerspectiveCamera = () => {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1 * earthRadius, 1000 * earthRadius);
        camera.position.set(2 * earthRadius, 0, -2 * earthRadius); // 东九区, 纬度0度
        window.camera = camera;
        return camera;
    };
    static addEarthMeshToScene = (scene) => {
        const loader = new THREE.TextureLoader();
        const map = loader.load(earth_nightmap);
        const specularMap = loader.load(earth_specular_map);

        // const material = new THREE.MeshPhongMaterial({
        //     color: defaultCubeColorRed,
        //     specular: 0xffffff,
        //     shininess: 100
        // });
        const material = new THREE.MeshPhongMaterial( {
            map,
            specularMap,
            specular: new THREE.Color('grey'),
        } );

        const geometry = new THREE.SphereGeometry(earthRadius, 64, 64);
        const earthMesh = new THREE.Mesh(geometry, material);
        earthMesh.position.set(0, 0, 0);
        earthMesh.rotateY(-Math.PI / 2);

        // ChinaProvinceBarChartUtils._addCloudMeshToEarthMesh(earthMesh);

        scene.add(earthMesh);
    };

    /**
     * @param scene
     * @param list: Array<{
     *     key: string;
     *     value: string;
     * }>
     */
    static addBarsToScene(scene, list) {
        const values = list.map(kv => kv.value);
        const maxValue = Math.max(...values);
        const maxBarHeight = 0.5 * earthRadius;

        // bigger value has a darker color, see: https://github.com/bpostlethwaite/colormap
        const colors = colormap({colormap: 'hot', nshades: 140}).slice(40); // do not use color which is too dark

        list.forEach(kv => {
            const barHeight = kv.value / maxValue * maxBarHeight;
            const colorIndex = Math.round(kv.value / maxValue * 99); // colorIndex = 0, 1, 2, ..., 99
            const color = colors[colorIndex];
            this._addBarToScene(kv.key, barHeight, color, scene);
        });
    }

    static _addBarToScene = (provinceName, barHeight, color, scene) => {
        const province = china_geojson.features.find(f => f.properties.name === provinceName);
        const center = province.properties.center;
        const r = earthRadius + barAltitude;

        this._addCubeToScene(center, barHeight, r, color, scene);

        /**
         *  province.geometry.coordinates: Array<MultiPolygon> 如: 台湾省
         *  MultiPolygon: Array<Polygon> 如: 台湾岛, 钓鱼岛, ...
         *  Polygon: Array<Ring> 如: 台湾岛外边界, 日月潭外边界, ...
         *  Ring: Array<[lan, lat]>
         */
        province.geometry.coordinates.forEach(polygon => {
            polygon.forEach(ring => this._addLineToScene(ring, r, scene));
        });
    };

    /**
     * @param center: [number, number]
     * @param barHeight: number
     * @param r: number
     * @param color: string; like: #000000
     * @param scene
     * @private
     */
    static _addCubeToScene(center, barHeight, r, color, scene) {
        const centerXYZ = ChinaProvinceBarChartAlgorithms.getXYZByLonLat(r, center[0], center[1]);
        const cubeWidth = earthRadius * 0.025; // set bottom side length
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(cubeWidth, barHeight, cubeWidth),
            new THREE.MeshPhongMaterial({
                color,
                specular: 0xffffff,
                shininess: 100,
                side: THREE.DoubleSide,
            }),
        );
        cube.position.set(...centerXYZ);
        const up = cube.up.clone().normalize();
        const normal = new THREE.Vector3(...centerXYZ).normalize();
        cube.quaternion.setFromUnitVectors(up, normal);
        cube.translateY(barHeight / 2);
        scene.add(cube);
    }

    /**
     * @param ring: Array<[number, number]>
     * @param r: number
     * @param scene
     * @private
     */
    static _addLineToScene(ring, r, scene) {
        const points = [];
        ring.forEach(lonLat => {
            const [x, y, z] = ChinaProvinceBarChartAlgorithms.getXYZByLonLat(r, lonLat[0], lonLat[1]);
            points.push(new THREE.Vector3(x, y, z));
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial( { color: defaultCubeColorRed } );
        const line = new THREE.Line( geometry, material );
        scene.add(line);
    }

    static _addCloudMeshToEarthMesh(earthMesh) {
        const loader = new THREE.TextureLoader();
        const geometry = new THREE.SphereGeometry(earthRadius + cloudAltitude, 64, 64);
        const material  = new THREE.MeshLambertMaterial({
            map: loader.load(earth_clouds),
            side: THREE.DoubleSide,
            opacity: 0.5,
            transparent: true,
            emissive: 0x333333, // 自发光
        });
        const cloudMesh = new THREE.Mesh(geometry, material);
        cloudMesh.name = 'cloudMesh';
        earthMesh.add(cloudMesh);
    }

    static _mapValueToColor(value, maxValue, minValue) {
        const ratio = (value - minValue) / (maxValue - minValue);
        const n = ratio * 255;

        const r = Math.round(Math.sin(0.024 * n + 0) * 127 + 128);
        const g = Math.round(Math.sin(0.024 * n + 2) * 127 + 128);
        const b = Math.round(Math.sin(0.024 * n + 4) * 127 + 128);

        return new THREE.Color(r, g, b).getHex();
    }
}