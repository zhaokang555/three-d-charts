import { Scene } from 'three';
import {
    addAxesToScene,
    addControlsToCamera,
    getOrthographicCamera,
    getRenderer,
    initHighlightBar,
} from '../CommonUtils';
import { addBarsToScene, addKeysOnTopToScene, addLightToScene, addValuesToScene, } from './Utils';
import IList from '../type/IList';
import { makeTextMeshesLookAtCamera } from './TextMesh';
import { PlaneMesh } from './PlaneMesh';

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
        makeTextMeshesLookAtCamera(scene, camera);
        renderer.render(scene, camera);
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};