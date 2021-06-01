import { Scene } from 'three';
import { addControlsToCamera, getRenderer, initHighlightCube, makeTextMeshesLookAtCamera } from '../CommonUtils';
import {
    addAxesToScene,
    addCubesToScene,
    addKeysOnTopToScene,
    addLightToScene,
    addPlaneToScene,
    addValuesToScene,
    getOrthographicCamera,
} from './Utils';
import { getCubeWidthByLists, getKeyAndValueMaxLength, getMaxAndMinValueByLists } from './Algorithms';
import IList from '../type/IList';

export const init = (lists: Array<IList>, container: HTMLElement): () => void => {
    const scene = new Scene();
    const cubeWidth = getCubeWidthByLists(lists);
    const [keyMaxLength, valueMaxLength] = getKeyAndValueMaxLength(lists);
    const [maxValue, minValue] = getMaxAndMinValueByLists(lists);

    lists.forEach((list, i) => {
        const keys = list.map(kv => kv.key);
        const values = list.map(kv => kv.value);

        const cubes = addCubesToScene(scene, values, i, cubeWidth, maxValue, minValue);
        addValuesToScene(scene, values, valueMaxLength, cubes);
        addKeysOnTopToScene(scene, keys, keyMaxLength, cubes);
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
        makeTextMeshesLookAtCamera(scene, camera, planeWidth);

        renderer.render(scene, camera);
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};