import * as THREE from 'three';
import Utils from '../utils';
import BarChartOnTheEarthUtils from './bar-chart-on-the-earth-utils';
import Constant from '../constant';

const {earthRadius} = Constant;

/**
 * @param list: Array<{
 *     key: string;
 *     value: string;
 * }>
 * @param container: HTMLElement
 */
export const init = (list, container) => {
    const scene = new THREE.Scene();
    const camera = BarChartOnTheEarthUtils.getPerspectiveCamera(scene);

    BarChartOnTheEarthUtils.addEarthMeshToScene(scene);
    BarChartOnTheEarthUtils.addBarsToScene(scene, list);

    BarChartOnTheEarthUtils.addLightToScene(scene);

    const renderer = Utils.getRenderer(container);
    const controls = Utils.addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        const cloudMesh = scene.getObjectByName('cloudMesh');
        if (cloudMesh) {
            cloudMesh.rotateX(-0.0002);
            cloudMesh.rotateY(0.0004);
        }

        renderer.render( scene, camera );
    };
    cancelId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(cancelId);
};