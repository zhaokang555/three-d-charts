import { Scene } from 'three';
import {
    addAxesToScene,
    addControlsToCamera,
    getOrthographicCamera,
    getRenderer,
} from '../CommonUtils';
import { addBarsToScene, addKeysOnTopToScene, addLightToScene, addValuesToScene, } from './Utils';
import IList from '../type/IList';
import { PlaneMesh } from './PlaneMesh';
import { RaycasterFromCamera } from '../components/RaycasterFromCamera';

export const init = (list: IList, container: HTMLElement): () => void => {
    const keys = list.map(kv => kv.key);
    const values = list.map(kv => kv.value);
    const keyMaxLength = Math.max(...keys.map(k => k.length));
    const valueMaxLength = Math.max(...values.map(v => v.toString().length));

    const scene = new Scene();
    addAxesToScene(scene, 1000000);
    const bars = addBarsToScene(scene, values);
    const keyTextMeshes = addKeysOnTopToScene(scene, keys, keyMaxLength, bars);
    const valueTextMeshes = addValuesToScene(scene, values, valueMaxLength, bars);
    const planeMesh = new PlaneMesh(bars);
    scene.add(planeMesh);
    addLightToScene(scene, planeMesh.width);

    const camera = getOrthographicCamera(container, planeMesh.width);
    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
        rotate: true,
        maxZoom: planeMesh.width * 2, // FIX ME
    });
    const ray = new RaycasterFromCamera(container, camera);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);

        controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true

        bars.forEach(b => b.unhighlight());
        ray.firstIntersectedObject(bars, intersectedBar => intersectedBar.highlight());

        keyTextMeshes.concat(valueTextMeshes).forEach(t => t.lookAtCamera(camera));
        renderer.render(scene, camera);
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};