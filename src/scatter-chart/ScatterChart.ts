import {
    AmbientLight,
    BufferAttribute,
    BufferGeometry,
    DoubleSide,
    Mesh,
    MeshLambertMaterial,
    PlaneGeometry,
    Points,
    PointsMaterial,
    Scene,
    Vector3
} from 'three';
import { addAxesToScene, addControlsToCamera, getOrthographicCamera, getRenderer } from '../CommonUtils';
import IPosition from '../type/IPosition';
import { colormap } from '../CommonAlgorithms';
import { defaultPlaneColorGray } from '../Constant';

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
    geometry.computeBoundingBox();
    geometry.setAttribute('color', new BufferAttribute(getVertexColors(geometry, list), 3));
    const pointCloud = new Points(geometry, new PointsMaterial({size: 4, vertexColors: true}));

    addHelperPlanes(pointCloud);

    scene.add(pointCloud);
};

const getVertices = (list: Array<Array<number>>) => {
    return Float32Array.from(list.reduce((total, current) => [...total, ...current], []))
};

const getVertexColors = (geometry: BufferGeometry, list: Array<IPosition>) => {
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

const addHelperPlanes = (pointCloud: Points) => {
    const max = pointCloud.geometry.boundingBox.max;
    const min = pointCloud.geometry.boundingBox.min;
    const xRange = max.x - min.x;
    const yRange = max.y - min.y;
    const zRange = max.z - min.z;
    const center = max.clone().lerp(min, 0.5);

    addHelperPlaneBottom(pointCloud, xRange, zRange, center);
};

const addHelperPlaneBottom = (pointCloud, width, height, center) => {
    const planeMesh = new Mesh(
        new PlaneGeometry(width, height),
        new MeshLambertMaterial({
            color: defaultPlaneColorGray,
            side: DoubleSide,
        })
    );
    planeMesh.rotateOnWorldAxis(new Vector3(1, 0, 0), Math.PI / 2);
    planeMesh.position.set(center.x, 0, center.z);

    pointCloud.add(planeMesh);
};
