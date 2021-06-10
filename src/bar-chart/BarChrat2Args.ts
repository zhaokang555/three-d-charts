import { Scene } from 'three';
import {
    addAxesToScene,
    useControls,
    getOrthographicCamera,
    useRenderer,
    makeInfoPanelLookAtCamera,
} from '../CommonUtils';
import { addBarsToScene, addInfoPanelToScene, addLightToScene, } from './Utils';
import { getBarWidthByLists, getMaxAndMinValueByLists } from './Algorithms';
import IList from '../type/IList';
import { PlaneMesh } from './PlaneMesh';
import { RaycasterFromCamera } from '../components/RaycasterFromCamera';
import { Chart } from '../components/Chart';

export class BarChart2Args extends Chart {
    constructor(lists: Array<IList>, container: HTMLElement) {
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
            () => makeInfoPanelLookAtCamera(scene, camera, infoPanels),
            () => renderer.render(scene, camera),
        ];
        this.cleanHooks = [
            ...this.cleanHooks,
            cleanRenderer,
            cleanControls,
        ]
    }

}