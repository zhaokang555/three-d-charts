import { Scene } from 'three';
import { addControlsToCamera, getRenderer, initHighlightCube } from '../CommonUtils';
import {
    addAxesToScene,
    addCubesToScene,
    addKeysOnTopToScene,
    addLightToScene,
    addPlaneToScene,
    addValuesToScene,
    getOrthographicCamera,
    getPlaneWidthFromScene
} from './Utils';
import { getCubeWidthByLists, getKeyAndValueMaxLength, getMaxAndMinValueByLists } from './Algorithms';
import IList from '../type/IList';

export const init = (lists: Array<IList>, container: HTMLElement): () => void => {
    const scene = new Scene();
    const cubeWidth = getCubeWidthByLists(lists);
    const [keyMaxlength, valueMaxlength] = getKeyAndValueMaxLength(lists);
    const [maxValue, minValue] = getMaxAndMinValueByLists(lists);

    lists.forEach((list, i) => {
        const keys = list.map(kv => kv.key);
        const values = list.map(kv => kv.value);

        addCubesToScene(scene, values, i, cubeWidth, maxValue, minValue);
        addAxesToScene(scene);
        addValuesToScene(scene, values, valueMaxlength, i);
        addKeysOnTopToScene(scene, keys, keyMaxlength, i);
        addPlaneToScene(scene);
    });

    addLightToScene(scene);
    const camera = getOrthographicCamera(scene, container);
    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: getPlaneWidthFromScene(scene) * 2, // FIX ME
    });
    const updateHighlight = initHighlightCube(scene, camera);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateHighlight();

        renderer.render(scene, camera);
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};