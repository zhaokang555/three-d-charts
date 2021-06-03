import { Scene } from 'three';
import {
    addAxesToScene,
    addControlsToCamera,
    getOrthographicCamera,
    getRenderer,
    initHighlightBar,
    makeTextMeshesLookAtCamera
} from '../CommonUtils';
import { addBarsToScene, addKeysOnTopToScene, addLightToScene, addPlaneToScene, addValuesToScene, } from './Utils';
import IList from '../type/IList';

export const init = (list: IList, container: HTMLElement): () => void => {
    const keys = list.map(kv => kv.key);
    const values = list.map(kv => kv.value);
    const keyMaxLength = Math.max(...keys.map(k => k.length));
    const valueMaxLength = Math.max(...values.map(v => v.toString().length));

    const scene = new Scene();
    addAxesToScene(scene, 1000000);
    const bars = addBarsToScene(scene, values);
    addKeysOnTopToScene(scene, keys, keyMaxLength, bars);
    addValuesToScene(scene, values, valueMaxLength, bars);
    const planeWidth = addPlaneToScene(scene);
    addLightToScene(scene, planeWidth);

    const camera = getOrthographicCamera(scene, container, planeWidth);
    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: planeWidth * 2, // FIX ME
    });
    const updateHighlight = initHighlightBar(scene, camera);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);

        controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
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