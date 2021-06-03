import earth_clouds from './2k_earth_clouds.jpeg';
import {
    AmbientLight,
    AxesHelper,
    DirectionalLight,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    SphereGeometry,
    TextureLoader
} from 'three';
import { getPositionByLonLat } from './Algorithms';
import { cloudAltitude, defaultLightColorWhite, earthRadius } from '../Constant';
import ICamera from '../type/ICamera';


export const addLightToScene = (scene: Scene, ambientLightIntensity = 0.7) => {
    const light = new DirectionalLight(defaultLightColorWhite, 0.7);
    light.position.copy(getPositionByLonLat(120, 0)); // 平行光的位置，直射东经120北纬0。例如：如果设置为(0, 1, 0), 那么光线将会从上往下照射。

    scene.add(light);
    scene.add(new AmbientLight(defaultLightColorWhite, ambientLightIntensity));
};

export const getPerspectiveCamera = (container: HTMLElement): ICamera => {
    const camera = new PerspectiveCamera(55, container.offsetWidth / container.offsetHeight, 0.001 * earthRadius, 20 * earthRadius);
    const rCamera = 2 * earthRadius; // 相机到地心距离

    camera.position.copy(getPositionByLonLat(120, 0, rCamera)); // 相机位置东经120北纬0
    camera.name = 'camera';
    return camera;
};

export const addAxesToScene = (scene: Scene) => {
    const axesHelper = new AxesHelper(earthRadius * 4);
    axesHelper.visible = false;
    axesHelper.name = 'axesHelper';
    scene.add(axesHelper);
};

export const addCloudMeshToScene = (scene: Scene, camera: ICamera): () => void => {
    const loader = new TextureLoader();
    const geometry = new SphereGeometry(earthRadius + cloudAltitude, 64, 64);
    const material = new MeshBasicMaterial({
        map: loader.load(earth_clouds),
        opacity: 0.2,
        transparent: true,
    });
    const cloudMesh = new Mesh(geometry, material);
    cloudMesh.name = 'cloudMesh';
    scene.add(cloudMesh);

    return () => {
        const distance = camera.position.length();
        cloudMesh.material.visible = true;
        cloudMesh.material.opacity = Math.min((distance - earthRadius) / earthRadius * 0.2, 0.4);
        if (cloudMesh.material.opacity < 0.05) {
            cloudMesh.material.visible = false;
            return;
        }
        cloudMesh.rotateX(-0.0002);
        cloudMesh.rotateY(0.0004);
    }
};
