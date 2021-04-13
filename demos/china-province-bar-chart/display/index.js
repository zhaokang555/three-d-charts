import * as THREE from 'three';
import {Utils, ChinaProvinceBarChartUtils} from '../../../src';

const scene = new THREE.Scene();
window.scene = scene;
const camera = ChinaProvinceBarChartUtils.getPerspectiveCamera(scene);

ChinaProvinceBarChartUtils.addEarthMeshToScene(scene);

Utils.addLightToScene(scene, 0.7, 0.7, [-0.5, 0.5, -2]);

const renderer = Utils.getRenderer();
const controls = Utils.addControlsToCamera(camera, renderer);
const render = () => {
    requestAnimationFrame(render);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    const cloudMesh = scene.getObjectByName('cloudMesh');
    cloudMesh.rotateX(-0.0002);
    cloudMesh.rotateY(0.0004);

    renderer.render( scene, camera );
};

render();
