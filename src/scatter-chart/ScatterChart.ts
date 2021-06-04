import { AmbientLight, BufferAttribute, BufferGeometry, Points, PointsMaterial, Scene } from 'three';
import { addAxesToScene, addControlsToCamera, getOrthographicCamera, getRenderer } from '../CommonUtils';
import IPosition from '../type/IPosition';
import { colormap } from '../CommonAlgorithms';

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
    geometry.setAttribute('position', new BufferAttribute(getVertices(list), 3));
    geometry.setAttribute('color', new BufferAttribute(getVertexColors(geometry, list), 3));

    const pointCloud = new Points(geometry, new PointsMaterial({size: 4, vertexColors: true}));
    scene.add(pointCloud);
};

const getVertices = (list: Array<Array<number>>) => {
    return Float32Array.from(list.reduce((total, current) => [...total, ...current], []))
};

const getVertexColors = (geometry: BufferGeometry, list: Array<IPosition>) => {
    geometry.computeBoundingBox();
    const max = geometry.boundingBox.max;
    const min = geometry.boundingBox.min;
    const yRange = max.y - min.y;
    const colors = colormap(100);
    const vertexColors = [];
    list.forEach(pos => {
        const colorIndex = Math.round((pos[1] - min.y) / yRange * 99);
        vertexColors.push(...colors[colorIndex].toArray());
    });
    return Float32Array.from(vertexColors);
};
