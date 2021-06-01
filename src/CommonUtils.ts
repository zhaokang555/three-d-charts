import {
    BoxGeometry,
    Matrix3,
    Mesh,
    MeshPhongMaterial,
    Object3D,
    OrthographicCamera,
    PerspectiveCamera,
    Raycaster,
    Scene,
    TextGeometry,
    Vector2,
    WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ICube from './type/ICube';
import ICamera from './type/ICamera';
import { defaultCubeColorRed, defaultCubeHighlightColorWhite } from './Constant';
import { getPlaneWidthFromScene } from './bar-chart/Utils';

export const getRenderer = (container: HTMLElement, camera: ICamera): [WebGLRenderer, () => void] => {
    const renderer = new WebGLRenderer();
    renderer.setSize(container.offsetWidth, container.offsetHeight); // 将输出canvas的大小调整为container的大小
    container.appendChild(renderer.domElement); // 将生成的canvas挂在container上

    const onWindowResize = () => {
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        // 1. 当缩小window宽度时, 因为container宽度>window宽度, window内会出现横向滚动条, 导致container高度(w1)<window高度.
        // 这时执行renderer.setSize, canvas宽度为w1
        // setSize之后, 横向滚动条消失container高度变为w2(w2>w1).
        // 所以需要再次setSize
        // 2. 当缩小window高度时同理
        // 3. 或者使用container overflow hidden
        renderer.setSize(container.offsetWidth, container.offsetHeight);

        const aspectRatio = container.offsetWidth / container.offsetHeight;
        if (camera instanceof PerspectiveCamera) {
            camera.aspect = aspectRatio;
        } else if (camera instanceof OrthographicCamera) {
            const halfW = camera.right;
            camera.top = halfW / aspectRatio;
            camera.bottom = -halfW / aspectRatio;
        }

        camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', onWindowResize);

    return [renderer, () => window.removeEventListener('resize', onWindowResize)];
};

type IOptions = {
    minDistance?: number;
    maxDistance?: number;
    rotate?: boolean;
    minZoom?: number;
    maxZoom?: number;
}
export const addControlsToCamera = (camera: ICamera, renderer: WebGLRenderer, options: IOptions = {}): [OrbitControls, () => void] => {
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true; // 是否有惯性
    controls.enableZoom = true; // 是否可以缩放
    controls.zoomSpeed = 0.5;
    if (camera.type === "PerspectiveCamera") {
        controls.minDistance = options.minDistance || 1; // 设置相机距离原点的最近距离
        controls.maxDistance = options.maxDistance || 1000; // 设置相机距离原点的最远距离
    } else if (camera.type === "OrthographicCamera") {
        controls.minZoom = options.minZoom || 0;
        controls.maxZoom = options.maxZoom || Infinity;
    }

    controls.enablePan = true; // 是否开启右键拖拽

    if (options.rotate) { //是否自动旋转
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
    }

    controls.listenToKeyEvents(window as any as HTMLElement);

    const onKeydown = (evt) => {
        switch (evt.code.toLowerCase()) {
            case 'pageup':
            case 'equal':
            case 'keyw':
            case 'home':
                renderer.domElement.dispatchEvent(new WheelEvent('wheel', {deltaY: -1}));
                break;
            case 'pagedown':
            case 'minus':
            case 'keys':
            case 'end':
                renderer.domElement.dispatchEvent(new WheelEvent('wheel', {deltaY: 1}));
                break;
            case 'space':
                controls.autoRotate = !controls.autoRotate;
                break;
        }
    };
    window.addEventListener('keydown', onKeydown);

    return [controls, () => window.removeEventListener('keydown', onKeydown)];
};

export const initHighlightCube = (scene: Scene, camera: ICamera): () => void => {
    const raycaster = new Raycaster();
    const pointer = new Vector2(-1, -1);
    document.addEventListener('pointermove', event => {
        // 1.
        // pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        // pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 2. or use matrix
        const w = window.innerWidth;
        const h = window.innerHeight;
        const translateMatrix = new Matrix3().set(1, 0, -w / 2,
            0, 1, -h / 2,
            0, 0, 1);
        const scaleMatrix = new Matrix3().set(2 / w, 0, 0,
            0, -2 / h, 0,
            0, 0, 1);
        pointer.copy(new Vector2(event.clientX, event.clientY)
            .applyMatrix3(translateMatrix)
            .applyMatrix3(scaleMatrix)
        );

    });
    const cubes = getCubes(scene);

    return () => {
        raycaster.setFromCamera(pointer, camera);

        if (cubes.length > 0) {
            cubes.forEach(cube => {
                const defaultColor = cube.defaultColor || defaultCubeColorRed;
                cube.material.color.set(defaultColor);
                _setTextMeshScaleTo1ByBottomCenter(scene.getObjectById(cube.keyMeshId));
                _setTextMeshScaleTo1ByBottomCenter(scene.getObjectById(cube.valueMeshId));
            });
            const intersects = raycaster.intersectObjects(cubes, true);
            if (intersects.length > 0) {
                const cube = intersects[0].object as ICube;
                cube.material.color.set(defaultCubeHighlightColorWhite);
                _setTextMeshScaleTo2ByBottomCenter(scene.getObjectById(cube.keyMeshId));
                _setTextMeshScaleTo2ByBottomCenter(scene.getObjectById(cube.valueMeshId));
            }
        }
    };
};

export const getCubes = (scene: Scene): Array<ICube> => {
    return scene.children.filter(
        child => child instanceof Mesh && child.geometry instanceof BoxGeometry
    ) as any as Array<ICube>;
};

export const makeTextMeshesLookAtCamera = (scene: Scene, camera: ICamera) => {
    const textMeshes = _getTextMeshes(scene);
    const lookAtPosition = camera.position.clone().setY(0);
    const minLength = getPlaneWidthFromScene(scene) * 100;
    const scale = minLength / lookAtPosition.length();
    if (scale > 1) {
        lookAtPosition.multiplyScalar(scale);
    }
    textMeshes.forEach(t => t.lookAt(lookAtPosition));
};

const _getTextMeshes = (scene: Scene): Array<Mesh<TextGeometry, MeshPhongMaterial>> => {
    return scene.children.filter(
        child => child instanceof Mesh && child.geometry instanceof TextGeometry
    ) as any as Array<Mesh<TextGeometry, MeshPhongMaterial>>;
};

const _setTextMeshScaleTo2ByBottomCenter = (mesh: Object3D | undefined) => {
    if (mesh) {
        mesh.scale.set(2, 2, 2);
    }
};

const _setTextMeshScaleTo1ByBottomCenter = (mesh: Object3D | undefined) => {
    if (mesh) {
        mesh.scale.set(1, 1, 1);
    }
};
