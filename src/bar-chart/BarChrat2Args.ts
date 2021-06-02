import { Scene } from 'three';
import {
    addControlsToCamera,
    getRenderer,
    initHighlightCube,
    makeInfoPanelLookAtCamera,
} from '../CommonUtils';
import {
    addAxesToScene,
    addCubesToScene, addInfoPanelToScene,
    addLightToScene,
    addPlaneToScene,
    getOrthographicCamera,
} from './Utils';
import { getCubeWidthByLists, getMaxAndMinValueByLists } from './Algorithms';
import IList from '../type/IList';

export const init = (lists: Array<IList>, container: HTMLElement): () => void => {
    const scene = new Scene();
    const cubeWidth = getCubeWidthByLists(lists);
    const [maxValue, minValue] = getMaxAndMinValueByLists(lists);

    const infoPanels = [];
    lists.forEach((list, i) => {
        const keys = list.map(kv => kv.key);
        const values = list.map(kv => kv.value);

        const cubes = addCubesToScene(scene, values, i, cubeWidth, maxValue, minValue);
        cubes.forEach((cube, i) => {
            const infoPanel = addInfoPanelToScene(scene, keys[i], values[i], cube);
            infoPanels.push(infoPanel);
        });
    });

    addAxesToScene(scene);
    const planeWidth = addPlaneToScene(scene);
    addLightToScene(scene, planeWidth);
    const camera = getOrthographicCamera(scene, container, planeWidth);
    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: planeWidth * 2, // FIX ME
    });
    const updateHighlight = initHighlightCube(scene, camera);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateHighlight();
        makeInfoPanelLookAtCamera(scene, camera, planeWidth, infoPanels);

        renderer.render(scene, camera);
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};