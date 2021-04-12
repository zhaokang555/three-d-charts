import * as THREE from 'three';
import {
    addAxesToScene,
    addControlsToCamera,
    addCubesToScene,
    addLightToScene,
    getPerspectiveCamera,
    getOrthographicCamera,
    getRenderer,
    getCubeWidthByValues,
    highlightCubeInFullWindowWithPerspectiveCamera,
    addValuesToScene,
    addKeysToScene,
} from "../../../src";


const keys = JSON.parse(localStorage.getItem('keys'));
const values = JSON.parse(localStorage.getItem('values'));
const cubeWidth = getCubeWidthByValues(values);

const scene = new THREE.Scene();
addCubesToScene(scene, values, cubeWidth);
addAxesToScene(scene);
addKeysToScene(scene, keys);
addValuesToScene(scene, values);
addLightToScene(scene, cubeWidth);

// const camera = getPerspectiveCamera(cubeWidth);
const camera = getOrthographicCamera(scene);
const pointer = new THREE.Vector2(-1, -1);
document.addEventListener( 'pointermove', event => {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
const renderer = getRenderer();
const controls = addControlsToCamera(camera, renderer);
const raycaster = new THREE.Raycaster();
const animate = function () {
    requestAnimationFrame(animate); // fallback: setTimeout 16.7

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    highlightCubeInFullWindowWithPerspectiveCamera(scene, camera, raycaster, pointer);

    renderer.render( scene, camera );
};

animate();