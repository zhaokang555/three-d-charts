import * as THREE from "three";
import earth_daymap from './8k_earth_daymap.jpeg';
import earth_nightmap from './8k_earth_nightmap.jpeg';
import earth_specular_map from './8k_earth_specular_map.png';
import earth_clouds from './8k_earth_clouds.png';
import china_geojson from "./china-geojson";
import ChinaProvinceBarChartAlgorithms from "./china-province-bar-chart-algorithms";
import Constant from "../constant";

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

    static addBarsToScene(scene, list) {
        const maxValue = Math.max(...list.map(kv => kv.value));

        list.forEach(kv => {
            this._addBarToScene(kv.key, kv.value / maxValue * earthRadius * 0.5, scene);
        });
    }

    static _addBarToScene = (provinceName, value, scene) => {
        console.log(china_geojson.features.map(f => f.properties.name));
        const province = china_geojson.features.find(f => f.properties.name === provinceName);
        console.log(province);

        const r = earthRadius + barAltitude;

        // 1. add bar
        const center = province.properties.center;
        const centerXYZ = ChinaProvinceBarChartAlgorithms.getXYZByLonLat(r, center[0], center[1]);
        const cubeWidth = earthRadius * 0.01;
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(cubeWidth, value, cubeWidth),
            new THREE.MeshPhongMaterial({
                color: defaultCubeColorRed,
                specular: 0xffffff,
                shininess: 100,
                side: THREE.DoubleSide,
            }),
        );
        cube.position.set(...centerXYZ);
        const up = cube.up.clone().normalize();
        const normal = new THREE.Vector3(...centerXYZ).normalize();
        cube.quaternion.setFromUnitVectors(up, normal);
        cube.translateY(value / 2);
        scene.add(cube);

        // 2. add line
        province.geometry.coordinates.forEach(polygon => {
            polygon.forEach(ring => {
                const points = [];
                ring.forEach(lonLat => {
                    const [x, y, z] = ChinaProvinceBarChartAlgorithms.getXYZByLonLat(r, lonLat[0], lonLat[1]);
                    points.push(new THREE.Vector3(x, y, z));
                });
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial( { color: defaultCubeColorRed } );
                const line = new THREE.Line( geometry, material );
                scene.add(line);
            })
        });
    };

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
}