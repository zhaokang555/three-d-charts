import { Scene } from 'three';
import { addAxesToScene, useControls, useRenderer } from '../CommonUtils';
import { addLightToScene, getPerspectiveCamera } from './Utils';
import { earthRadius } from '../Constant';
import IRoute from '../type/IRoute';
import ICity from '../type/ICity';
import { EarthMeshForRoute } from '../components/EarthMeshForRoute';
import { Chart } from '../components/Chart';

export class CityRouteChart extends Chart {
    constructor(list: Array<IRoute>, container: HTMLElement, extraCities: Array<ICity> = []) {
        const scene = new Scene();
        addAxesToScene(scene, earthRadius * 4);
        addLightToScene(scene, 1);

        const camera = getPerspectiveCamera(container);

        const earthMesh = new EarthMeshForRoute();
        const updateRoutesAndInfoPanels = earthMesh.addRoutes(list, extraCities, camera);
        scene.add(earthMesh);

        const [renderer, cleanRenderer] = useRenderer(container, camera);
        const [controls, cleanControls] = useControls(camera, renderer, {
            minDistance: 1.05 * earthRadius,
            maxDistance: 10 * earthRadius
        });

        super();
        this.frameHooks = [
            ...this.frameHooks,
            () => controls.update(),
            updateRoutesAndInfoPanels,
            () => renderer.render(scene, camera),
        ];
        this.cleanHooks = [
            ...this.cleanHooks,
            cleanRenderer,
            cleanControls,
        ];
    }
}