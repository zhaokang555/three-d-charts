import { Scene } from 'three';
import { addAxesToScene, addControlsToCamera, getRenderer } from '../CommonUtils';
import { addLightToScene, getPerspectiveCamera } from './Utils';
import { earthRadius } from '../Constant';
import IList from '../type/IList';
import { EarthMeshForProvince } from '../components/EarthMeshForProvince';
import { Chart } from '../components/Chart';

export class ChinaProvinceBarChart extends Chart {
    constructor(list: IList, container: HTMLElement) {
        const scene = new Scene();
        addLightToScene(scene);
        addAxesToScene(scene, earthRadius * 4);

        const camera = getPerspectiveCamera(container);

        const earthMesh = new EarthMeshForProvince();
        earthMesh.addProvinces(list);
        scene.add(earthMesh);

        const [renderer, cleanRenderer] = getRenderer(container, camera);
        const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
            minDistance: 1.05 * earthRadius,
            maxDistance: 10 * earthRadius
        });

        super();
        this.frameHooks = [
            ...this.frameHooks,
            () => controls.update(),
            () => renderer.render(scene, camera),
        ];
        this.cleanHooks = [
            ...this.cleanHooks,
            cleanRenderer,
            cleanControls,
        ];
    }

}