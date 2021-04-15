import * as THREE from "three";
import earth_daymap from './8k_earth_daymap.jpeg';
import earth_nightmap from './8k_earth_nightmap.jpeg';
import earth_specular_map from './8k_earth_specular_map.png';
import earth_clouds from './8k_earth_clouds.png';
import china_geojson from "./china-geojson";
import ChinaProvinceBarChartAlgorithms from "./china-province-bar-chart-algorithms";
import Constant from "../constant";

const earthRadius = 1;

export default class ChinaProvinceBarChartUtils {
    static getPerspectiveCamera = () => {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(earthRadius, earthRadius, -earthRadius); // 东九区, 纬度45度
        return camera;
    };
    static addEarthMeshToScene = (scene) => {
        const loader = new THREE.TextureLoader();
        const map = loader.load(earth_daymap);
        const specularMap = loader.load(earth_specular_map);

        // const material = new THREE.MeshPhongMaterial({
        //     color: Constant.defaultCubeColorRed,
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

        ChinaProvinceBarChartUtils._addCloudMeshToEarthMesh(earthMesh);

        scene.add(earthMesh);
    };

    static addBarsToScene(scene) {
        // TODO
        const hubei = china_geojson.features.find(f => f.properties.name === '湖北省');
        console.log(hubei);
        hubei.geometry.coordinates.forEach(polygon => {
            polygon.forEach(ring => {
                const points = [];
                ring.forEach(lonLat => {
                    const [x, y, z] = ChinaProvinceBarChartAlgorithms.getXYZByLonLat(earthRadius * 1.003, lonLat[0], lonLat[1]);
                    points.push(new THREE.Vector3(x, y, z));
                });
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial( { color: Constant.defaultCubeColorRed } );
                const line = new THREE.Line( geometry, material );
                scene.add(line);
            })
        });
    }

    static _addCloudMeshToEarthMesh(earthMesh) {
        const loader = new THREE.TextureLoader();
        const geometry = new THREE.SphereGeometry(earthRadius * 1.002, 64, 64);
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