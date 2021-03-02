import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {CUBE_WIDTH, PLANE_OFFSET_Z} from "./constant";
import {getPositionOfNthBar} from "./bar-chart-algorithm";

export const addLightToScene = (scene) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.castShadow = true;
    light.position.set(1, 1, 1);

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshLambertMaterial({color: 0xcccccc}));
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = PLANE_OFFSET_Z;
    plane.receiveShadow = true;
    scene.add(plane);

    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffff00, 0.2));
};

/**
 * @param scene: THREE.Scene
 * @param values: Array<number>
 * @param cubeWidth: number
 */
export const addCubesToScene = (scene, values, cubeWidth = CUBE_WIDTH) => {
    values.forEach((value, index) => {
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(cubeWidth, value, cubeWidth),
            new THREE.MeshPhongMaterial({
                color: 0xff0000,
                specular: 0xffff00,
                shininess: 100
            }),
        );
        cube.position.set(...getPositionOfNthBar(index, value));
        cube.castShadow = true;
        scene.add(cube);
    });
};

export const getRenderer = () => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    document.body.appendChild(renderer.domElement);
    return renderer;
};

export const getCamera = () => {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 10;
    camera.position.y = 10;
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
};

export const addControlsToCamera = (camera, renderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);

    // 如果使用animate方法时，将此函数删除
    //controls.addEventListener( 'change', render );
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //controls.dampingFactor = 0.25;
    //是否可以缩放
    controls.enableZoom = true;
    //是否自动旋转
    controls.autoRotate = false;
    //设置相机距离原点的最远距离
    controls.minDistance = 5;
    //设置相机距离原点的最远距离
    controls.maxDistance = 200;
    //是否开启右键拖拽
    controls.enablePan = true;
};

export const addAxesToScene = (scene) => {
    const axesHelper = new THREE.AxesHelper( 1 );
    scene.add( axesHelper );
};