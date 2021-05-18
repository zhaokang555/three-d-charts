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
    Utils.addAxesToScene(scene);

    const updateCloud = Utils.addEarthMeshToScene(scene);
    Utils.addBarsToScene(scene, list);

    Utils.addLightToScene(scene);

    const renderer = CommonUtils.getRenderer(container);
    const controls = CommonUtils.addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });
    const updateHighlight = CommonUtils.initHighlightCube(scene, camera);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateHighlight();
        updateCloud();

        renderer.render( scene, camera );
    };
    cancelId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(cancelId);
};