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
import IList from '../type/IList';

export const init = (list: IList, container: HTMLElement): () => void => {
    const keys = list.map(kv => kv.key);
    const values = list.map(kv => kv.value);
    const keyMaxLength = Math.max(...keys.map(k => k.length));
    const valueMaxLength = Math.max(...values.map(v => v.toString().length));

    const scene = new Scene();
    addCubesToScene(scene, values);
    addAxesToScene(scene);
    addKeysOnTopToScene(scene, keys, keyMaxLength);
    addValuesToScene(scene, values, valueMaxLength);
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
        cancelId = requestAnimationFrame(render); // fallback: setTimeout

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