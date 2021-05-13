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
    const updateRoutes = BarChartOnTheEarthUtils.addRoutesToScene(scene, list);

    BarChartOnTheEarthUtils.addLightToScene(scene);

    const renderer = Utils.getRenderer(container);
    const controls = Utils.addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });
    const render = () => {
        requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateRoutes();

        renderer.render( scene, camera );
    };

    render();
};