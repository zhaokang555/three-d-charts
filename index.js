import * as THREE from 'three';
import {
    addAxesToScene,
    addControlsToCamera,
    addCubesToScene,
    addLightToScene,
    getCamera,
    getRenderer
} from "./src/graphic-utils";

const scene = new THREE.Scene();
addAxesToScene(scene);
addLightToScene(scene);
addCubesToScene(scene, [3, 4, 5, 6, 7]);

const camera = getCamera();
window.camera = camera;
const renderer = getRenderer();
const controls = addControlsToCamera(camera, renderer);

const animate = function () {
    requestAnimationFrame( animate );

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render( scene, camera );
};

animate();