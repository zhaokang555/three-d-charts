import * as THREE from 'three';
import {
    addAxesToScene,
    addControlsToCamera,
    addCubesToScene,
    addLightToScene,
    getOrthographicCamera,
    getRenderer
} from "./src/graphic-utils";
import {getCubeWidthByValues} from "./src/bar-chart-algorithm";

const scene = new THREE.Scene();
const keys = ['AAA', 'BBBB', 'CCCCC', 'DDDDDD', 'EEEEEEE'];
const values = [3, 4, 5, 6, 7];
const cubeWidth = getCubeWidthByValues(values);

addCubesToScene(scene, values, cubeWidth);
addAxesToScene(scene, keys, cubeWidth);
addLightToScene(scene, cubeWidth);

const camera = getOrthographicCamera(cubeWidth, values);
window.camera = camera;
console.log(camera.position);
const renderer = getRenderer();
const controls = addControlsToCamera(camera, renderer);

const animate = function () {
    requestAnimationFrame( animate ); // fallback: setTimeout 16.7

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render( scene, camera );
};

animate();