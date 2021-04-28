import * as THREE from 'three';
import BarChartUtils from "./bar-chart-utils";
import Utils from "../utils";
import BarChartAlgorithms from "./bar-chart-algorithms";

/**
 * @param lists: Array<Array<{
 *     key: string;
 *     value: string;
 * }>>
 */
export const init = (lists) => {
    const scene = new THREE.Scene();
    const cubeWidth = BarChartAlgorithms.getCubeWidthByLists(lists);

    lists.forEach((list, i) => {
        const keys = list.map(kv => kv.key);
        const values = list.map(kv => kv.value);

        BarChartUtils.addCubesToScene(scene, values, i, cubeWidth);
        BarChartUtils.addKeysOnTopToScene(scene, keys, i);
        BarChartUtils.addPlaneToScene(scene);
    });

    BarChartUtils.addLightToScene(scene);
    const camera = BarChartUtils.getOrthographicCamera(scene);
    const renderer = Utils.getRenderer();
    const controls = Utils.addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: BarChartUtils.getPlaneWidthFromScene(scene) * 2, // FIX ME
    });

    const render = () => {
        requestAnimationFrame(render); // fallback: setTimeout 16.7

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        renderer.render( scene, camera );
    };

    render();
};