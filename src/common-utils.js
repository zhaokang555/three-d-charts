import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Constant from "./constant";
import {Vector3} from "three";

export default class CommonUtils {
    /**
     * @param container: HTMLElement
     * @return {THREE.WebGLRenderer}
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

    /**
     * @param scene: THREE.Scene
     * @param camera: THREE.Camera
     * @return {function}
     */
    static initHighlightCube = (scene, camera) => {
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2(-1, -1);
        document.addEventListener('pointermove', event => {
            // 1.
            // pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            // pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // 2. or use matrix
            const w = window.innerWidth;
            const h = window.innerHeight;
            const translateMatrix = new THREE.Matrix3().set(1, 0, -w / 2,
                0, 1, -h / 2,
                0, 0, 1);
            const scaleMatrix = new THREE.Matrix3().set(2 / w, 0, 0,
                0, -2 / h, 0,
                0, 0, 1);
            pointer.copy(new THREE.Vector2(event.clientX, event.clientY)
                .applyMatrix3(translateMatrix)
                .applyMatrix3(scaleMatrix)
            );

        });
        const cubes = CommonUtils.getCubes(scene);

        return () => {
            raycaster.setFromCamera(pointer, camera);

            if (cubes.length > 0) {
                cubes.forEach(cube => {
                    const defaultColor = cube.defaultColor || Constant.defaultCubeColorRed;
                    cube.material.color.set(defaultColor);
                    CommonUtils._setTextMeshScaleTo1ByBottomCenter(scene.getObjectById(cube.keyMeshId));
                    CommonUtils._setTextMeshScaleTo1ByBottomCenter(scene.getObjectById(cube.valueMeshId));
                });
                const intersects = raycaster.intersectObjects(cubes, true);
                if (intersects.length > 0) {
                    const cube = intersects[0].object;
                    cube.material.color.set(Constant.defaultCubeHighlightColorWhite);
                    CommonUtils._setTextMeshScaleTo2ByBottomCenter(scene.getObjectById(cube.keyMeshId));
                    CommonUtils._setTextMeshScaleTo2ByBottomCenter(scene.getObjectById(cube.valueMeshId));
                }
            }
        };
    };

    static getCubes = (scene) => {
        return scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
    };

    /**
     * @param mesh: THREE.Mesh
     */
    static _setTextMeshScaleTo2ByBottomCenter = (mesh) => {
        if (mesh) {
            mesh.scale.set(2, 2, 2);
        }
    };

    /**
     * @param mesh: THREE.Mesh
     */
    static _setTextMeshScaleTo1ByBottomCenter = (mesh) => {
        if (mesh) {
            mesh.scale.set(1, 1, 1);
        }
    };
}