import { Scene } from 'three';
import {
    addAxesToScene,
    addControlsToCamera,
    getOrthographicCamera,
    getRenderer,
    initHighlightBar,
    makeInfoPanelLookAtCamera,
} from '../CommonUtils';
import { addBarsToScene, addInfoPanelToScene, addLightToScene, } from './Utils';
import { getBarWidthByLists, getMaxAndMinValueByLists } from './Algorithms';
import IList from '../type/IList';
import { PlaneMesh } from './PlaneMesh';

export const init = (lists: Array<IList>, container: HTMLElement): () => void => {
    const scene = new Scene();
    const barWidth = getBarWidthByLists(lists);
    const [maxValue, minValue] = getMaxAndMinValueByLists(lists);

    const bars = [];
    const infoPanels = [];
    lists.forEach((list, i) => {
        const keys = list.map(kv => kv.key);
        const values = list.map(kv => kv.value);

        const barsInLine = addBarsToScene(scene, values, i, barWidth, maxValue, minValue);
        barsInLine.forEach((bar, i) => {
            const infoPanel = addInfoPanelToScene(scene, keys[i], values[i], bar);
            infoPanels.push(infoPanel);
        });
        bars.push(...barsInLine);
    });

    addAxesToScene(scene, 1000000);
    const planeMesh = new PlaneMesh(bars);
    scene.add(planeMesh);
    addLightToScene(scene, planeMesh.width);
    const camera = getOrthographicCamera(container, planeMesh.width);
    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: planeMesh.width * 2, // FIX ME
    });
    const updateHighlight = initHighlightBar(bars, camera, container);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);

        controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
        updateHighlight();
        makeInfoPanelLookAtCamera(scene, camera, infoPanels);
        renderer.render(scene, camera);
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};