import {
    AmbientLight, AxesHelper,
    BufferAttribute,
    BufferGeometry,
    DoubleSide, LineBasicMaterial,
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
import { LineSegments } from 'three/src/objects/LineSegments';

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
    const diagonal = max.clone().sub(min);
    max.addScaledVector(diagonal.clone().normalize(), diagonal.length() * 0.05);
    min.addScaledVector(diagonal.clone().normalize(), diagonal.length() * -0.05);
    const center = max.clone().lerp(min, 0.5);

    const planes = [
        addHelperPlaneFar(pointCloud, max, min, center),
        addHelperPlaneBottom(pointCloud, max, min, center),
        addHelperPlaneLeft(pointCloud, max, min, center),
    ];

    const axesHelper = new AxesHelper(diagonal.length()) as LineSegments<BufferGeometry, LineBasicMaterial>;
    axesHelper.position.copy(min);
    axesHelper.material.vertexColors = false;
    axesHelper.material.color.set('#ffffff');
    pointCloud.add(axesHelper)
};

const addHelperPlaneFar = (pointCloud, max, min, center) => {
    const planeMesh = new Mesh(
        new PlaneGeometry(max.x - min.x, max.y - min.y),
        createHelperPlaneMaterial()
    );
    planeMesh.position.set(center.x, center.y, min.z);

    pointCloud.add(planeMesh);
    return planeMesh;
};

const addHelperPlaneBottom = (pointCloud, max, min, center) => {
    const planeMesh = new Mesh(
        new PlaneGeometry(max.x - min.x, max.z - min.z),
        createHelperPlaneMaterial()
    );
    planeMesh.rotateOnWorldAxis(new Vector3(1, 0, 0), Math.PI / 2);
    planeMesh.position.set(center.x, min.y, center.z);

    pointCloud.add(planeMesh);
    return planeMesh;
};

const addHelperPlaneLeft = (pointCloud, max, min, center) => {
    const planeMesh = new Mesh(
        new PlaneGeometry(max.z - min.z, max.y - min.y),
        createHelperPlaneMaterial()
    );
    planeMesh.rotateOnWorldAxis(new Vector3(0, 1, 0), Math.PI / 2);
    planeMesh.position.set(min.x, center.y, center.z);

    pointCloud.add(planeMesh);
    return planeMesh;
};

const createHelperPlaneMaterial = () => {
    return new MeshLambertMaterial({
        side: DoubleSide,
        transparent: true,
        opacity: 0.6,
    });
};
