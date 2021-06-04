import { AmbientLight, BufferAttribute, BufferGeometry, Points, PointsMaterial, Scene } from 'three';
import { addAxesToScene, addControlsToCamera, getOrthographicCamera, getRenderer } from '../CommonUtils';
import IPosition from '../type/IPosition';

export const init = (list: Array<IPosition>, container: HTMLElement) => {
    const scene = new Scene();
    addAxesToScene(scene, 10);
    scene.add(new AmbientLight()); // 环境光
    const camera = getOrthographicCamera(scene, container, 10);
    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer);

    addPointCloudToScene(scene, list);

    let cancelId = null;
    const render = () => {
        cancelId = requestAnimationFrame(render);
        controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
        renderer.render(scene, camera);
    };
    cancelId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(cancelId);
        cleanRenderer();
        cleanControls();
    };
};

const addPointCloudToScene = (scene: Scene, list: Array<IPosition>) => {
    const geometry = new BufferGeometry();
    const vertices = Float32Array.from(list.reduce((total, current) => {
        total.push(...current);
        return total;
    }, []));
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));

    const pointCloud = new Points(geometry, new PointsMaterial({size: 3}));
    scene.add(pointCloud);
};
