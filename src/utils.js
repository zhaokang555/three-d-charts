import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default class Utils {
    static getRenderer = () => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight); // 将输出canvas的大小调整为(width, height)
        document.body.appendChild(renderer.domElement); // 将生成的canvas挂在body上
        return renderer;
    };

    /**
     * @param camera: THREE.Camera
     * @param renderer: THREE.WebGLRenderer
     * @param options: {
     *     minDistance?: number;
     *     maxDistance?: number;
     *     rotate?: boolean;
     * }
     * @return {OrbitControls}
     */
    static addControlsToCamera = (camera, renderer, options = {}) => {
        const controls = new OrbitControls(camera, renderer.domElement);

        controls.enableDamping = true; // 是否有惯性
        controls.enableZoom = true; // 是否可以缩放
        controls.minDistance = options.minDistance || 1; // 设置相机距离原点的最近距离
        controls.maxDistance = options.maxDistance || 1000; // 设置相机距离原点的最远距离
        controls.enablePan = true; // 是否开启右键拖拽

        if (options.rotate) { //是否自动旋转
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
        }

        return controls;
    };
}