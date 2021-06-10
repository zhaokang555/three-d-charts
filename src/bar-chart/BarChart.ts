import { Scene } from 'three';
import { addAxesToScene, useControls, getOrthographicCamera, useRenderer, } from '../CommonUtils';
import { addBarsToScene, addKeysOnTopToScene, addLightToScene, addValuesToScene, } from './Utils';
import IList from '../type/IList';
import { PlaneMesh } from './PlaneMesh';
import { RaycasterFromCamera } from '../components/RaycasterFromCamera';
import { Chart } from '../components/Chart';

export class BarChart extends Chart {
    constructor(list: IList, container: HTMLElement) {
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
        const [renderer, cleanRenderer] = useRenderer(container, camera);
        const [controls, cleanControls] = useControls(camera, renderer, {
            rotate: true,
            maxZoom: planeMesh.width * 2, // FIX ME
        });
        const ray = new RaycasterFromCamera(container, camera);

        super();
        this.frameHooks = [
            ...this.frameHooks,
            () => controls.update(), // required if controls.enableDamping or controls.autoRotate are set to true
            () => bars.forEach(b => b.unhighlight()),
            () => ray.firstIntersectedObject(bars, intersectedBar => intersectedBar.highlight()),
            () => keyTextMeshes.concat(valueTextMeshes).forEach(t => t.lookAtCamera(camera)),
            () => renderer.render(scene, camera),
        ];
        this.cleanHooks = [
            ...this.cleanHooks,
            cleanRenderer,
            cleanControls,
        ];
    }
}