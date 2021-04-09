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
    highlightClickedCubeInFullWindowWithPerspectiveCamera,
    highlightHoveredCubeInFullWindowWithPerspectiveCamera,
} from "../../../src";

const scene = new THREE.Scene();

window.THREE = THREE;
window.scene = scene;
const keys = JSON.parse(localStorage.getItem('keys'));
const values = JSON.parse(localStorage.getItem('values'));
const cubeWidth = getCubeWidthByValues(values);

addCubesToScene(scene, values, cubeWidth);
addAxesToScene(scene, keys, cubeWidth);
addLightToScene(scene, cubeWidth);

const camera = getPerspectiveCamera(cubeWidth);
// const camera = getOrthographicCamera(scene);
document.addEventListener( 'pointermove', event => {
    window.pointer = {
        x: ( event.clientX / window.innerWidth ) * 2 - 1,
        y: - ( event.clientY / window.innerHeight ) * 2 + 1,
    }
});
const renderer = getRenderer();
const controls = addControlsToCamera(camera, renderer);

const animate = function () {
    requestAnimationFrame(animate); // fallback: setTimeout 16.7

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    highlightHoveredCubeInFullWindowWithPerspectiveCamera(scene, camera);

    renderer.render( scene, camera );
};

animate();