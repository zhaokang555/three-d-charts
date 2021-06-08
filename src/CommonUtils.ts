import {
    AxesHelper,
    CanvasTexture,
    Color,
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
import ICamera from './type/ICamera';
import { getTextColorByBackgroundColor } from './CommonAlgorithms';
import KeyValueInfoPanelMesh from './components/KeyValueInfoPanelMesh';
import { BarMesh, getBars } from './bar-chart/BarMesh';

export const getOrthographicCamera = (scene: Scene, container: HTMLElement, size: number) => {
    const aspectRatio = container.offsetWidth / container.offsetHeight;

    const x = size;
    const y = x / aspectRatio;
    const camera = new OrthographicCamera(-x, x, y, -y, -size * 4, size * 4);

    camera.position.set(-x / 2, x / 2, x); // see from left-front-top position
    // camera.lookAt(0, 0, 0);
    return camera;
};

export const addAxesToScene = (scene: Scene, size: number) => {
    const axesHelper = new AxesHelper(size);
    axesHelper.visible = true;
    axesHelper.name = 'axesHelper';
    scene.add(axesHelper);
};

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

type IControlOptions = {
    minDistance?: number;
    maxDistance?: number;
    rotate?: boolean;
    minZoom?: number;
    maxZoom?: number;
}
export const addControlsToCamera = (camera: ICamera, renderer: WebGLRenderer, options: IControlOptions = {}): [OrbitControls, () => void] => {
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

    // TODO: support multiple charts in one page
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

export const initHighlightBar = (scene: Scene, camera: ICamera, container: HTMLElement): () => void => {
    const raycaster = new Raycaster();
    const mousePosition = getRealtimeMousePositionRef(container);
    const bars = getBars(scene);

    return () => {
        raycaster.setFromCamera(mousePosition, camera);

        if (bars.length > 0) {
            bars.forEach(bar => {
                bar.unhighlight();
                _setTextMeshScaleTo1ByBottomCenter(scene.getObjectById(bar.keyMeshId));
                _setTextMeshScaleTo1ByBottomCenter(scene.getObjectById(bar.valueMeshId));
            });
            const intersects = raycaster.intersectObjects(bars);
            if (intersects.length > 0) {
                const bar = intersects[0].object as BarMesh;
                bar.highlight();
                _setTextMeshScaleTo2ByBottomCenter(scene.getObjectById(bar.keyMeshId));
                _setTextMeshScaleTo2ByBottomCenter(scene.getObjectById(bar.valueMeshId));
            }
        }
    };
};

export const makeTextMeshesLookAtCamera = (scene: Scene, camera: ICamera) => {
    _getTextMeshes(scene).forEach(textMesh => {
        const lookAtPosition = camera.position.clone().setY(textMesh.position.y);
        textMesh.lookAt(lookAtPosition);
    });
};

export const makeInfoPanelLookAtCamera = (scene: Scene, camera: ICamera, infoPanels: Array<KeyValueInfoPanelMesh>) => {
    infoPanels.forEach(info => {
        const lookAtPosition = camera.position.clone().setY(info.position.y);
        info.lookAt(lookAtPosition);
    });
};

type IKeyValueCanvasTextureOptions = {
    textColor?: string;
    padding?: number; // 0~1
    borderRadius?: number; // 0~1
};
export const createKeyValueCanvasTexture = (key: string, value: number, bgColor: Color,
                                            options: IKeyValueCanvasTextureOptions = {}) => {
    const canvas = document.createElement('canvas');
    const size = 200;
    const padding = size * (options.padding || 0.1);
    const contentSize = size - padding * 2;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#' + bgColor.getHexString();
    ctx.fillRect(0, 0, size, size);

    // test font size
    const defaultFontSize = 10;
    ctx.font = `${defaultFontSize}px sans-serif`;
    const keyWidth = ctx.measureText(key).width;
    const valueWidth = ctx.measureText(value.toString()).width;
    const scale = contentSize / Math.max(keyWidth, valueWidth);
    const font = `${defaultFontSize * scale}px sans-serif`;

    const line1Position: [number, number] = [size / 2, padding + contentSize * 0.25];
    const line2Position: [number, number] = [size / 2, padding + contentSize * 0.75];

    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = options.textColor || getTextColorByBackgroundColor(bgColor);
    ctx.fillText(key, ...line1Position, size);
    ctx.fillText(value.toString(), ...line2Position, size);
    const map = new CanvasTexture(canvas);
    map.center.set(0.5, 0.5);

    const roundedCornerRect = new Path2D();
    const r = size * (options.borderRadius || 0.1);
    roundedCornerRect.moveTo( 0, r);
    roundedCornerRect.lineTo(0, size - r);
    roundedCornerRect.arcTo(0, size, r, size, r);
    roundedCornerRect.lineTo(size - r, size);
    roundedCornerRect.arcTo(size, size, size, size - r, r);
    roundedCornerRect.lineTo(size, r);
    roundedCornerRect.arcTo(size, 0, size - r, 0, r);
    roundedCornerRect.lineTo(r, 0);
    roundedCornerRect.arcTo(0, 0, 0, r, r);

    const canvasAlphaMap = document.createElement('canvas');
    canvasAlphaMap.width = canvasAlphaMap.height = size;
    const ctxAlphaMap = canvasAlphaMap.getContext('2d');
    ctxAlphaMap.fillStyle = '#000000';
    ctxAlphaMap.fillRect(0, 0, size, size);
    ctxAlphaMap.fillStyle = 'rgb(0, 190, 0)';
    ctxAlphaMap.fill(roundedCornerRect);
    ctxAlphaMap.font = font;
    ctxAlphaMap.textAlign = 'center';
    ctxAlphaMap.textBaseline = 'middle';
    ctxAlphaMap.fillStyle = '#00ff00';
    ctxAlphaMap.fillText(key, ...line1Position, size);
    ctxAlphaMap.fillText(value.toString(), ...line2Position, size);

    const alphaMap = new CanvasTexture(canvasAlphaMap);
    alphaMap.center.set(0.5, 0.5);

    return [map, alphaMap];
};

export const getRealtimeMousePositionRef = (container: HTMLElement): Vector2 => {
    const pointer = new Vector2(-1, -1);
    container.addEventListener('pointermove', event => {
        // 1.
        // pointer.x = ( event.offsetX / container.offsetWidth ) * 2 - 1;
        // pointer.y = -(event.offsetY / container.offsetHeight) * 2 + 1;

        // 2. or use matrix
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        const translateMatrix = new Matrix3().set(1, 0, -w / 2,
            0, 1, -h / 2,
            0, 0, 1);
        const scaleMatrix = new Matrix3().set(2 / w, 0, 0,
            0, -2 / h, 0,
            0, 0, 1);
        pointer.copy(new Vector2(event.offsetX, event.offsetY)
            .applyMatrix3(translateMatrix)
            .applyMatrix3(scaleMatrix)
        );
    });
    return pointer;
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
