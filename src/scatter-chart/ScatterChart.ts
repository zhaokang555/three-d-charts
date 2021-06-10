import { AmbientLight, Box3, Scene, Vector3 } from 'three';
import { addAxesToScene, useControls, getOrthographicCamera, useRenderer } from '../CommonUtils';
import IPosition from '../type/IPosition';
import { getVertices, ScatterPoints } from './ScatterPoints';
import { Chart } from '../components/Chart';

export class ScatterChart extends Chart {
    constructor(list: Array<IPosition>, container: HTMLElement) {
        const boxSize = (new Box3()).setFromArray(getVertices(list)).getSize(new Vector3());

        const scene = new Scene();
        addAxesToScene(scene, Math.min(boxSize.x, boxSize.y, boxSize.z));
        scene.add(new AmbientLight()); // 环境光

        const camera = getOrthographicCamera(container, boxSize.length());

        const [renderer, cleanRenderer] = useRenderer(container, camera);
        const [controls, cleanControls] = useControls(camera, renderer);

        const scatterPoints = new ScatterPoints(list, container, camera);
        scene.add(scatterPoints);

        super();
        this.frameHooks = [
            ...this.frameHooks,
            () => controls.update(),
            () => scatterPoints.update(),
            () => renderer.render(scene, camera),
        ];
        this.cleanHooks = [
            ...this.cleanHooks,
            cleanRenderer,
            cleanControls,
        ];
    }
}
