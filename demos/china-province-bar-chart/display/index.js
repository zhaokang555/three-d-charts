import * as THREE from 'three';
import {Utils, ChinaProvinceBarChartUtils} from '../../../src';

const scene = new THREE.Scene();
const camera = ChinaProvinceBarChartUtils.getPerspectiveCamera(scene);

const earthMesh = ChinaProvinceBarChartUtils.getEarthMesh();
scene.add(earthMesh);

Utils.addLightToScene(scene);

const renderer = Utils.getRenderer();
const render = () => {
    requestAnimationFrame(render);

    renderer.render( scene, camera );
};

render();
