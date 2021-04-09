import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {getPositionOfNthBar, getPositionOfNthKey} from "./bar-chart-algorithm";
import helvetiker_regular from "./helvetiker_regular.typeface.json";

export const addLightToScene = (scene, cubeWidth) => {
    // create light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 2);

    // create plane
    let planeWidth = 100;
    const cubePositions = scene.children
        .filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry')
        .map(cube => cube.position);
    if (cubePositions.length > 0) {
        const maxX = Math.max(...cubePositions.map(p => Math.abs(p.x)));
        const maxZ = Math.max(...cubePositions.map(p => Math.abs(p.z)));
        planeWidth = Math.max(maxX, maxZ) * 2 + cubeWidth;
    }
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeWidth),
        new THREE.MeshLambertMaterial({color: 0xcccccc}));
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
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
                specular: 0xffffff,
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

export const getOrthographicCamera = (scene) => {
    const ratio = window.innerWidth / window.innerHeight;

    let x = 100;
    const plane = scene.children.find(child => child.type === 'Mesh' && child.geometry.type === 'PlaneGeometry');
    if (plane) {
        x = plane.geometry.parameters.width;
    }
    const y = x / ratio;
    const camera = new THREE.OrthographicCamera(-x, x, y, -y);

    camera.position.set(-x, x, x);
    return camera;
};

export const getPerspectiveCamera = (cubeWidth) => {
    let x = 100;
    const plane = scene.children.find(child => child.type === 'Mesh' && child.geometry.type === 'PlaneGeometry');
    if (plane) {
        x = plane.geometry.parameters.width / 2 * 1.732;
    }

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = x;
    camera.position.y = x;
    camera.position.z = x;

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
    controls.minDistance = 1;
    //设置相机距离原点的最远距离
    controls.maxDistance = 1000;
    //是否开启右键拖拽
    controls.enablePan = true;

    controls.autoRotateSpeed = 0.5;

    return controls;
};

export const addAxesToScene = (scene, keys, cubeWidth) => {
    // add axes
    const axesHelper = new THREE.AxesHelper( 1 );
    scene.add( axesHelper );

    // add text of keys to axes
    const loader = new THREE.FontLoader();
    const font = loader.parse( helvetiker_regular);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const fontSize = cubeWidth / key.length;
        const fontDepth = fontSize / 8;
        const geometry = new THREE.TextGeometry( key, {
            font: font,
            size: fontSize,
            height: fontDepth,
            // curveSegments: 12,
            // bevelEnabled: true,
            // bevelThickness: 20,
            // bevelSize: 8,
            // bevelSegments: 3
        });
        const material = new THREE.MeshPhongMaterial({color: 0x156289,});
        const text = new THREE.Mesh( geometry, material );
        text.position.set(...getPositionOfNthKey(i, cubeWidth, fontDepth));
        scene.add(text);
    }
};