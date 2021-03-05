import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {getPositionOfNthBar} from "./bar-chart-algorithm";

export const addLightToScene = (scene, cubeWidth) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 2);

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100),
        new THREE.MeshLambertMaterial({color: 0xcccccc}));
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0 - cubeWidth / 10;
    scene.add(plane);

    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
};

/**
 * @param scene: THREE.Scene
 * @param values: Array<number>
 * @param cubeWidth: number
 */
export const addCubesToScene = (scene, values, cubeWidth) => {
    for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(cubeWidth, value, cubeWidth),
            new THREE.MeshPhongMaterial({
                color: 0xff0000,
                specular: 0xffff00,
                shininess: 100
            }),
        );
        cube.position.set(...getPositionOfNthBar(i, value, cubeWidth));
        scene.add(cube);
    }
};

export const getRenderer = () => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
};

export const getCamera = (cubeWidth) => {
    // const ratio = window.innerWidth / window.innerHeight;
    // const camera = new THREE.OrthographicCamera(-20 * ratio, 20 * ratio, 20, -20, -100, 100);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 15 * cubeWidth;
    camera.position.y = 15 * cubeWidth;
    camera.position.z = 15 * cubeWidth;
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
    // controls.dampingFactor = 0.25;
    //是否可以缩放
    controls.enableZoom = true;
    //是否自动旋转
    controls.autoRotate = true;
    //设置相机距离原点的最近距离
    controls.minDistance = 5;
    //设置相机距离原点的最远距离
    controls.maxDistance = 200;
    //是否开启右键拖拽
    controls.enablePan = true;

    return controls;
};

export const addAxesToScene = (scene) => {
    const axesHelper = new THREE.AxesHelper( 1 );
    scene.add( axesHelper );
};