import * as THREE from "three";
import earth_daymap from './8k_earth_daymap.jpeg';
import earth_nightmap from './8k_earth_nightmap.jpeg';
import earth_specular_map from './8k_earth_specular_map.png';

const earthRadius = 1;

export default class ChinaProvinceBarChartUtils {
    static getPerspectiveCamera = (scene) => {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const distance = Math.cbrt(Math.pow(earthRadius, 2) / 3) + 0.3;
        camera.position.set(distance, distance, distance);
        camera.lookAt(0, 0, 0);
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
        scene.add(earthMesh);
    };
}