import { Scene } from 'three';
import { addControlsToCamera, getRenderer } from '../CommonUtils';
import {
    addAxesToScene,
    addProvincesToScene,
    addLightToScene,
    getPerspectiveCamera
} from './Utils';
import { earthRadius } from '../Constant';
import IList from '../type/IList';
import { EarthMesh } from '../components/EarthMesh';

export const init = (list: IList, container: HTMLElement): () => void => {
    const scene = new Scene();
    addAxesToScene(scene);
    const camera = getPerspectiveCamera(container);

    scene.add(new EarthMesh());
    addProvincesToScene(scene, list);
    addLightToScene(scene);

    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });

    let animationFrameId = null;
    const render = () => {
        animationFrameId = requestAnimationFrame(render);

        controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
        renderer.render( scene, camera );
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(animationFrameId);
        cleanRenderer();
        cleanControls();
    };
};