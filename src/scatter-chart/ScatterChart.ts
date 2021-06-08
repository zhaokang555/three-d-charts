import { AmbientLight, Box3, Scene } from 'three';
import { addAxesToScene, addControlsToCamera, getOrthographicCamera, getRenderer } from '../CommonUtils';
import IPosition from '../type/IPosition';
import { getVertices, ScatterPoints } from './ScatterPoints';

export const init = (list: Array<IPosition>, container: HTMLElement) => {
    const scene = new Scene();
    addAxesToScene(scene, 10);
    scene.add(new AmbientLight()); // 环境光

    const box = new Box3();
    box.setFromArray(getVertices(list));
    const size = box.max.distanceTo(box.min);
    const camera = getOrthographicCamera(scene, container, size);

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