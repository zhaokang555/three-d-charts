import { Scene } from 'three';
import { addControlsToCamera, getRenderer } from '../CommonUtils';
import { addAxesToScene, addLightToScene, getPerspectiveCamera } from './Utils';
import { earthRadius } from '../Constant';
import IRoute from '../type/IRoute';
import ICity from '../type/ICity';
import { EarthMeshForRoute } from '../components/EarthMeshForRoute';

export const init = (list: Array<IRoute>, container: HTMLElement, extraCities: Array<ICity> = []): () => void => {
    const scene = new Scene();
    addAxesToScene(scene);
    addLightToScene(scene, 1);

    const camera = getPerspectiveCamera(container);

    const earthMesh = new EarthMeshForRoute();
    const updateRoutesAndInfoPanels = earthMesh.addRoutes(list, extraCities, camera);
    scene.add(earthMesh);

    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });

    let animationFrameId = null;
    const render = () => {
        animationFrameId = requestAnimationFrame(render);

        controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
        updateRoutesAndInfoPanels();
        renderer.render(scene, camera);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(animationFrameId);
        cleanRenderer();
        cleanControls();
    };
};