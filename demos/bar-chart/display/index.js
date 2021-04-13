import * as THREE from 'three';
import {BarChartUtils, Utils} from "../../../src";


const keys = JSON.parse(localStorage.getItem('keys'));
const values = JSON.parse(localStorage.getItem('values'));

const scene = new THREE.Scene();
BarChartUtils.addCubesToScene(scene, values);
BarChartUtils.addAxesToScene(scene);
BarChartUtils.addKeysToScene(scene, keys);
BarChartUtils.addValuesToScene(scene, values);
Utils.addLightToScene(scene);
BarChartUtils.addPlaneToScene(scene);

// const camera = getPerspectiveCamera(scene);
const camera = BarChartUtils.getOrthographicCamera(scene);
const pointer = new THREE.Vector2(-1, -1);
document.addEventListener( 'pointermove', event => {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
const renderer = Utils.getRenderer();
const controls = BarChartUtils.addControlsToCamera(camera, renderer);
const raycaster = new THREE.Raycaster();
const animate = function () {
    requestAnimationFrame(animate); // fallback: setTimeout 16.7

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    BarChartUtils.highlightCubeInFullWindowWithPerspectiveCamera(scene, camera, raycaster, pointer);

    renderer.render( scene, camera );
};

animate();