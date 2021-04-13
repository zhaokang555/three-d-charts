import * as THREE from 'three';
import {Utils, ChinaProvinceBarChartUtils} from '../../../src';

const scene = new THREE.Scene();
const camera = ChinaProvinceBarChartUtils.getPerspectiveCamera(scene);

ChinaProvinceBarChartUtils.addEarthMeshToScene(scene);

Utils.addLightToScene(scene, 0.6);

const renderer = Utils.getRenderer();
const controls = Utils.addControlsToCamera(camera, renderer);
const render = () => {
    requestAnimationFrame(render);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render( scene, camera );
};

render();
