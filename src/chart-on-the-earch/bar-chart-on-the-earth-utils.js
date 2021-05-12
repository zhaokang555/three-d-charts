import * as THREE from "three";
import china_geo_json from "./china.geo.json";
import china_city from './china_city.json';
import BarChartOnTheEarthAlgorithms from "./bar-chart-on-the-earth-algorithms";
import Constant from "../constant";
import colormap from 'colormap';
import earth_nightmap from './8k_earth_nightmap.jpeg';
import earth_specular_map from './8k_earth_specular_map.png';
import earth_clouds from './8k_earth_clouds.png';
import * as turf from '@turf/turf';
import point from './point.png';

const {earthRadius, defaultCubeColorRed, barAltitude, cloudAltitude} = Constant;

export default class BarChartOnTheEarthUtils {
    static addLightToScene = (scene) => {
        const light = new THREE.DirectionalLight(Constant.defaultLightColorWhite, 0.7);
        const lonRadianOfUtc8 = -120 / 180 * Math.PI; // XZ坐标系下, 东八区经度对应的弧度
        light.position.set(Math.cos(lonRadianOfUtc8), 0, Math.sin(lonRadianOfUtc8)); // 平行光的位置，直射东八区。例如：如果设置为(0, 1, 0), 那么光线将会从上往下照射。

        scene.add(light);
        scene.add(new THREE.AmbientLight(Constant.defaultLightColorWhite, 0.7));
    };

    static getPerspectiveCamera = () => {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001 * earthRadius, 20 * earthRadius);
        const lonRadianOfUtc8 = -120 / 180 * Math.PI; // XZ坐标系下, 东八区经度对应的弧度
        const rCamera = 2 * earthRadius; // 相机到地心距离

        camera.position.set(Math.cos(lonRadianOfUtc8) * rCamera, 0, Math.sin(lonRadianOfUtc8) * rCamera); // 东8区, 纬度0度
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
            specularMap, // 镜面反射贴图
            specular: 0x808080,
            shininess: 22,
        } );

        const geometry = new THREE.SphereGeometry(earthRadius, 64, 64);
        const earthMesh = new THREE.Mesh(geometry, material);
        earthMesh.position.set(0, 0, 0);
        // earthMesh.rotateY(-Math.PI / 2);

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

    /**
     * @param scene
     * @param list: Array<{
     *     from: string;
     *     to: string;
     *     weight: number;
     * }>
     */
    static addRoutesToScene(scene, list) {
        const maxWeight = Math.max(...list.map(line => line.weight));
        const minWeight = Math.min(...list.map(line => line.weight));
        const textureAndSpeedList = [];

        list.forEach(({from, to, weight}) => {
            const fromCity = china_city.find(item => item.name === from);
            const toCity = china_city.find(item => item.name === to);
            if (fromCity && toCity) {
                const fromVec = new THREE.Vector3(...BarChartOnTheEarthAlgorithms.getXYZByLonLat(
                    earthRadius,
                    fromCity.coordinates[0],
                    fromCity.coordinates[1]
                ));
                const toVec = new THREE.Vector3(...BarChartOnTheEarthAlgorithms.getXYZByLonLat(
                    earthRadius,
                    toCity.coordinates[0],
                    toCity.coordinates[1]
                ));

                const midpoint = turf.midpoint(fromCity.coordinates, toCity.coordinates); // 测地线中点
                const curveHeight = BarChartOnTheEarthAlgorithms.getCurveHeight(fromCity.coordinates, toCity.coordinates);
                const controlPointVec = new THREE.Vector3(...BarChartOnTheEarthAlgorithms.getXYZByLonLat(
                    earthRadius + curveHeight,
                    midpoint.geometry.coordinates[0],
                    midpoint.geometry.coordinates[1],
                ));

                const curve = new THREE.QuadraticBezierCurve3( // 三维二次贝塞尔曲线
                    fromVec,
                    controlPointVec,
                    toVec
                );

                // using BufferGeometry().setFromPoints()
                // const points = curve.getPoints( 50 );
                // const geometry = new THREE.BufferGeometry().setFromPoints( points );
                // const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
                // const curveObject = new THREE.Line( geometry, material );

                // using TubeGeometry
                const loader = new THREE.TextureLoader();
                const texture = loader.load(point);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                // note: speed = (0.002 ~ 0.012) * earthRadius
                const speed = (0.002 + 0.01 * (weight - minWeight) / (maxWeight - minWeight)) * earthRadius;
                textureAndSpeedList.push({texture, speed});

                const geometry = new THREE.TubeGeometry( curve, 64, 0.002 * earthRadius, 8, false );
                const material = new THREE.MeshPhongMaterial({
                    map: texture,
                    // color: 0x00ff00,
                    // side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.8
                });
                const curveObject = new THREE.Mesh( geometry, material );
                scene.add( curveObject );
            }
        });

        const updateRoutes = () => {
            textureAndSpeedList.forEach(({texture: t, speed: s}) => t.offset.x -= s);
        };

        return updateRoutes;
    }

    static _addBarToScene = (provinceName, barHeight, color, scene) => {
        const province = china_geo_json.features.find(f => f.properties.name === provinceName);
        const center = province.properties.center;
        const r = earthRadius + barAltitude;

        this._addCubeToScene(center, barHeight, r, color, scene);

        /**
         *  province.geometry.coordinates: Array<MultiPolygon> 如: 台湾省
         *  MultiPolygon: Array<Polygon> 如: 台湾岛, 钓鱼岛, ...
         *  Polygon: Array<Ring> 如: 台湾岛外边界, 日月潭外边界, ...
         *  Ring: Array<[lan, lat]>
         */
        province.geometry.coordinates.forEach(polygon => { // all province.geometry.type === 'MultiPolygon'
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
        const centerXYZ = BarChartOnTheEarthAlgorithms.getXYZByLonLat(r, center[0], center[1]);
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
            const [x, y, z] = BarChartOnTheEarthAlgorithms.getXYZByLonLat(r, lonLat[0], lonLat[1]);
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