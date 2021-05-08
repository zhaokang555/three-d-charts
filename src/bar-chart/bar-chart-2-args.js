import * as THREE from 'three';
import BarChartUtils from "./bar-chart-utils";
import Utils from "../utils";
import BarChartAlgorithms from "./bar-chart-algorithms";

/**
 * @param lists: Array<Array<{
 *     key: string;
 *     value: string;
 * }>>
 * @param container: HTMLElement
 */
export const init = (lists, container) => {
    const scene = new THREE.Scene();
    const cubeWidth = BarChartAlgorithms.getCubeWidthByLists(lists);
    const [keyMaxlength, valueMaxlength] = BarChartAlgorithms.getKeyAndValueMaxLength(lists);
    const [maxValue, minValue] = BarChartAlgorithms.getMaxAndMinValueByLists(lists);

    lists.forEach((list, i) => {
        const keys = list.map(kv => kv.key);
        const values = list.map(kv => kv.value);

        BarChartUtils.addCubesToScene(scene, values, i, cubeWidth, maxValue, minValue);
        BarChartUtils.addAxesToScene(scene);
        BarChartUtils.addValuesToScene(scene, values, valueMaxlength, i);
        BarChartUtils.addKeysOnTopToScene(scene, keys, keyMaxlength, i);
        BarChartUtils.addPlaneToScene(scene);
    });

    BarChartUtils.addLightToScene(scene);
    const camera = BarChartUtils.getOrthographicCamera(scene);
    const renderer = Utils.getRenderer(container);
    const controls = Utils.addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: BarChartUtils.getPlaneWidthFromScene(scene) * 2, // FIX ME
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-1, -1);
    document.addEventListener( 'pointermove', event => {
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    const render = () => {
        requestAnimationFrame(render); // fallback: setTimeout 16.7

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        BarChartUtils.highlightCubeInFullWindow(scene, camera, raycaster, pointer);

        renderer.render( scene, camera );
    };

    render();
};