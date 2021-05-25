import * as THREE from 'three';
import Utils from "./utils";
import CommonUtils from "../common-utils";
import Algorithms from "./algorithms";

/**
 * @param lists: Array<Array<{
 *     key: string;
 *     value: string;
 * }>>
 * @param container: HTMLElement
 */
export const init = (lists, container) => {
    const scene = new THREE.Scene();
    const cubeWidth = Algorithms.getCubeWidthByLists(lists);
    const [keyMaxlength, valueMaxlength] = Algorithms.getKeyAndValueMaxLength(lists);
    const [maxValue, minValue] = Algorithms.getMaxAndMinValueByLists(lists);

    lists.forEach((list, i) => {
        const keys = list.map(kv => kv.key);
        const values = list.map(kv => kv.value);

        Utils.addCubesToScene(scene, values, i, cubeWidth, maxValue, minValue);
        Utils.addAxesToScene(scene);
        Utils.addValuesToScene(scene, values, valueMaxlength, i);
        Utils.addKeysOnTopToScene(scene, keys, keyMaxlength, i);
        Utils.addPlaneToScene(scene);
    });

    Utils.addLightToScene(scene);
    const camera = Utils.getOrthographicCamera(scene, container);
    const renderer = CommonUtils.getRenderer(container, camera);
    const controls = CommonUtils.addControlsToCamera(camera, renderer, {
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

    return () => cancelAnimationFrame(cancelId);
};