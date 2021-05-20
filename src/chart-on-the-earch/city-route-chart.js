import * as THREE from 'three';
import CommonUtils from '../common-utils';
import Utils from './utils';
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
    const camera = Utils.getPerspectiveCamera(scene);
    window.THREE = THREE;
    window.camera = camera;
    Utils.addAxesToScene(scene);

    const renderer = CommonUtils.getRenderer(container);
    const updateCloud = Utils.addEarthMeshToScene(scene, renderer);
    const updateRoutes = Utils.addRoutesToScene(scene, list);

    Utils.addLightToScene(scene, 1);

    const controls = CommonUtils.addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateRoutes();
        updateCloud();

        renderer.render( scene, camera );
    };
    cancelId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(cancelId);
};