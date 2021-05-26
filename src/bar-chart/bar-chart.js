import * as THREE from 'three';
import Utils from "./utils";
import CommonUtils from "../common-utils";

/**
 * @param list: Array<{
 *     key: string;
 *     value: string;
 * }>
 * @param container: HTMLElement
 */
export const init = (list, container) => {
    const keys = list.map(kv => kv.key);
    const values = list.map(kv => kv.value);
    const keyMaxLength = Math.max(...keys.map(k => k.length));
    const valueMaxLength = Math.max(...values.map(v => v.toString().length));

    const scene = new THREE.Scene();
    Utils.addCubesToScene(scene, values);
    Utils.addAxesToScene(scene);
    Utils.addKeysToScene(scene, keys, keyMaxLength);
    Utils.addValuesToScene(scene, values, valueMaxLength);
    Utils.addLightToScene(scene);
    Utils.addPlaneToScene(scene);

    const camera = Utils.getOrthographicCamera(scene, container);
    const [renderer, cleanRenderer] = CommonUtils.getRenderer(container, camera);
    const [controls, cleanControls] = CommonUtils.addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: Utils.getPlaneWidthFromScene(scene) * 2, // FIX ME
    });
    const updateHighlight = CommonUtils.initHighlightCube(scene, camera);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render); // fallback: setTimeout

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateHighlight();

        renderer.render( scene, camera );
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};