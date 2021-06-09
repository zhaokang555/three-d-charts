import { AmbientLight, Box3, Scene, Vector3 } from 'three';
import { addAxesToScene, addControlsToCamera, getOrthographicCamera, getRenderer } from '../CommonUtils';
import IPosition from '../type/IPosition';
import { getVertices, ScatterPoints } from './ScatterPoints';

export const init = (list: Array<IPosition>, container: HTMLElement) => {
    const boxSize = (new Box3()).setFromArray(getVertices(list)).getSize(new Vector3());

    const scene = new Scene();
    addAxesToScene(scene, Math.min(boxSize.x, boxSize.y, boxSize.z));
    scene.add(new AmbientLight()); // 环境光

    const camera = getOrthographicCamera(scene, container, boxSize.length());

    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer);

    const scatterPoints = new ScatterPoints(list, container, camera);
    scene.add(scatterPoints);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);
        controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
        scatterPoints.update();
        renderer.render(scene, camera);
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};
