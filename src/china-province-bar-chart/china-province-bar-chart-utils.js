import * as THREE from "three";
import Constant from "../constant";

export default class ChinaProvinceBarChartUtils {
    static getPerspectiveCamera = (scene) => {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        return camera;
    };
    static getEarthMesh = () => {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: Constant.defaultCubeColorRed,
            specular: 0xffffff,
            shininess: 100
        });
        const earthMesh = new THREE.Mesh(geometry, material);
        earthMesh.position.set(0, 0, 0);
        return earthMesh;
    };
}