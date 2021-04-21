import * as THREE from 'three';
import Utils from '../utils';
import ChinaProvinceBarChartUtils from './china-province-bar-chart-utils';
import Constant from '../constant';

const {earthRadius} = Constant;

/**
 * @param list: Array<{
 *     key: string;
 *     value: string;
 * }>
 */
export const init = (list) => {
    const scene = new THREE.Scene();
    const camera = ChinaProvinceBarChartUtils.getPerspectiveCamera(scene);

    ChinaProvinceBarChartUtils.addEarthMeshToScene(scene);
    ChinaProvinceBarChartUtils.addBarsToScene(scene, list);

    ChinaProvinceBarChartUtils.addLightToScene(scene, 0.7, 0.7, [-0.5, 0.5, -2]);

    const renderer = Utils.getRenderer();
    const controls = Utils.addControlsToCamera(camera, renderer, {minDistance: earthRadius, maxDistance: 1000 * earthRadius});
    const render = () => {
        requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        const cloudMesh = scene.getObjectByName('cloudMesh');
        if (cloudMesh) {
            cloudMesh.rotateX(-0.0002);
            cloudMesh.rotateY(0.0004);
        }

        renderer.render( scene, camera );
    };

    render();
};