import * as THREE from 'three';
import {Utils, ChinaProvinceBarChartUtils} from '../../../src';

const scene = new THREE.Scene();
const camera = ChinaProvinceBarChartUtils.getPerspectiveCamera(scene);

const earthMesh = ChinaProvinceBarChartUtils.getEarthMesh();
scene.add(earthMesh);

Utils.addLightToScene(scene);

const renderer = Utils.getRenderer();
const controls = Utils.addControlsToCamera(camera, renderer);
const render = () => {
    requestAnimationFrame(render);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render( scene, camera );
};

render();
