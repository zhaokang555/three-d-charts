import { Scene } from 'three';
import { addControlsToCamera, getRenderer, initHighlightCube } from '../CommonUtils';
import {
    addAxesToScene,
    addBarsToScene,
    addCloudMeshToScene,
    addEarthMeshToScene,
    addLightToScene,
    getPerspectiveCamera
} from './Utils';
import { earthRadius } from '../Constant';
import IList from '../type/IList';

export const init = (list: IList, container: HTMLElement): () => void => {
    const scene = new Scene();
    addAxesToScene(scene);
    const camera = getPerspectiveCamera(container);

    addEarthMeshToScene(scene);
    const updateCloud = addCloudMeshToScene(scene, camera);
    addBarsToScene(scene, list);
    addLightToScene(scene);
    const updateHighlight = initHighlightCube(scene, camera);

    const [renderer, cleanRenderer] = getRenderer(container, camera);
    const [controls, cleanControls] = addControlsToCamera(camera, renderer, {
        minDistance: 1.05 * earthRadius,
        maxDistance: 10 * earthRadius
    });

    let animationFrameId = null;
    const render = () => {
        animationFrameId = requestAnimationFrame(render);

        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();

        updateHighlight();
        updateCloud();

        renderer.render( scene, camera );
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(animationFrameId);
        cleanRenderer();
        cleanControls();
    };
};