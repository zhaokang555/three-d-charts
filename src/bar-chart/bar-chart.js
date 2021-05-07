import * as THREE from 'three';
import BarChartUtils from "./bar-chart-utils";
import Utils from "../utils";

/**
 * @param list: Array<{
 *     key: string;
 *     value: string;
 * }>
 */
export const init = (list) => {
    const keys = list.map(kv => kv.key);
    const values = list.map(kv => kv.value);
    const valueMaxLength = Math.max(...values.map(v => v.toString().length));

    const scene = new THREE.Scene();
    BarChartUtils.addCubesToScene(scene, values);
    BarChartUtils.addAxesToScene(scene);
    BarChartUtils.addKeysToScene(scene, keys);
    BarChartUtils.addValuesToScene(scene, values, valueMaxLength);
    BarChartUtils.addLightToScene(scene);
    BarChartUtils.addPlaneToScene(scene);

    // const camera = BarChartUtils.getPerspectiveCamera(scene);
    const camera = BarChartUtils.getOrthographicCamera(scene);
    const pointer = new THREE.Vector2(-1, -1);
    document.addEventListener( 'pointermove', event => {
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    const renderer = Utils.getRenderer();
    const controls = Utils.addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: BarChartUtils.getPlaneWidthFromScene(scene) * 2, // FIX ME
    });
    const raycaster = new THREE.Raycaster();
    const render = () => {
        requestAnimationFrame(render); // fallback: setTimeout 16.7

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        BarChartUtils.highlightCubeInFullWindow(scene, camera, raycaster, pointer);

        renderer.render( scene, camera );
    };

    render();
};