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
 * @param extraCities: Array<{
 *     name: string;
 *     coordinates: [number, number];
 * }>
 */
export const init = (list, container, extraCities = []) => {
    const scene = new THREE.Scene();
    Utils.addAxesToScene(scene);
    const camera = Utils.getPerspectiveCamera(container);

    const updateCloud = Utils.addEarthMeshToScene(scene, camera);
    const updateRoutes = Utils.addRoutesToScene(scene, list, extraCities);
    Utils.addLightToScene(scene, 1);

    const [renderer, cleanRenderer] = CommonUtils.getRenderer(container, camera);
    const controls = CommonUtils.addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });

    let animationFrameId = null;
    const render = () => {
        animationFrameId = requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateRoutes();
        updateCloud();

        renderer.render( scene, camera );
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(animationFrameId);
        cleanRenderer();
    };
};