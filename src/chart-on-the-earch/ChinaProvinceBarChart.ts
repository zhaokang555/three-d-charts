import { Scene } from 'three';
import { addAxesToScene, addControlsToCamera, getRenderer } from '../CommonUtils';
import { addLightToScene, getPerspectiveCamera } from './Utils';
import { earthRadius } from '../Constant';
import IList from '../type/IList';
import { EarthMeshForProvince } from '../components/EarthMeshForProvince';

export const init = (list: IList, container: HTMLElement): () => void => {
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

    let animationFrameId = null;
    const render = () => {
        animationFrameId = requestAnimationFrame(render);

        controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
        renderer.render(scene, camera);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(animationFrameId);
        cleanRenderer();
        cleanControls();
    };
};