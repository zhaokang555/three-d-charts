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

    // const camera = BarChartUtils.getPerspectiveCamera(scene);
    const camera = Utils.getOrthographicCamera(scene);
    const renderer = CommonUtils.getRenderer(container);
    const controls = CommonUtils.addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: Utils.getPlaneWidthFromScene(scene) * 2, // FIX ME
    });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-1, -1);
    document.addEventListener( 'pointermove', event => {
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render); // fallback: setTimeout

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        CommonUtils.highlightCubeInFullWindow(scene, camera, raycaster, pointer);

        renderer.render( scene, camera );
    };
    cancelId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(cancelId);
};