import * as THREE from 'three';
import CommonUtils from '../common-utils';
import Utils from './utils';
import Constant from '../constant';
import * as LOD from "./lod";

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
    Utils.addAxesToScene(scene);
    const camera = Utils.getPerspectiveCamera(scene);

    const updateCloud = Utils.addEarthMeshToScene(scene);
    Utils.addBarsToScene(scene, list);
    Utils.addLightToScene(scene);
    const updateHighlight = CommonUtils.initHighlightCube(scene, camera);

    const renderer = CommonUtils.getRenderer(container);
    const controls = CommonUtils.addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });

    const intervalId = setInterval(() => {
        LOD.getLevelAndIntersectCoordinatesByCameraPosition(scene, camera, renderer);
    }, 2000); // can be smaller when in prod

    let animationFrameId = null;
    const render = () => {
        animationFrameId = requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateHighlight();
        updateCloud();

        renderer.render( scene, camera );
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(animationFrameId);
        clearInterval(intervalId);
    };
};