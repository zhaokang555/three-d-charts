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
addCubesToScene(scene, [8, 9, 10]);

const camera = getCamera();
const renderer = getRenderer();
addControlsToCamera(camera, renderer);

const animate = function () {
    requestAnimationFrame( animate );

    renderer.render( scene, camera );
};

animate();