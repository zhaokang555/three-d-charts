import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default class CommonUtils {
    /**
     * @param container: HTMLElement
     * @return {WebGLRenderer}
     */
    static getRenderer = (container) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.offsetWidth, container.offsetHeight); // 将输出canvas的大小调整为container的大小
        container.appendChild(renderer.domElement); // 将生成的canvas挂在container上
        return renderer;
    };

    /**
     * @param camera: THREE.Camera
     * @param renderer: THREE.WebGLRenderer
     * @param options: {
     *     minDistance?: number;
     *     maxDistance?: number;
     *     rotate?: boolean;
     *     minZoom?: number;
     *     maxZoom?: number;
     * }
     * @return {OrbitControls}
     */
    static addControlsToCamera = (camera, renderer, options = {}) => {
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

        return controls;
    };
}