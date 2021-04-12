import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {getPositionOfKeyByCube, getPositionOfNthBar, getPositionOfValueByCube} from "./bar-chart-algorithm";
import {
    defaultCubeColorRed,
    defaultCubeHighlightColorWhite,
    defaultLightColorWhite,
    defaultPlaneColorGray,
    defaultTextColorBlue
} from '../constant'
import helvetiker_regular from "../helvetiker_regular.typeface.json";

export const addLightToScene = (scene, cubeWidth) => {
    // create light
    const light = new THREE.DirectionalLight(defaultLightColorWhite, 1);
    light.position.set(1, 1, 2);

    // create plane
    let planeWidth = 100;
    const cubePositions = getCubes(scene).map(cube => cube.position);
    if (cubePositions.length > 0) {
        const maxX = Math.max(...cubePositions.map(p => Math.abs(p.x)));
        const maxZ = Math.max(...cubePositions.map(p => Math.abs(p.z)));
        planeWidth = Math.max(maxX, maxZ) * 2 + cubeWidth;
    }
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeWidth),
        new THREE.MeshLambertMaterial({color: defaultPlaneColorGray}));
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    scene.add(plane);

    scene.add(light);
    scene.add(new THREE.AmbientLight(defaultLightColorWhite, 0.4));
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
                color: defaultCubeColorRed,
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

export const addAxesToScene = (scene, keys) => {
    // add axes
    const axesHelper = new THREE.AxesHelper( 1 );
    scene.add( axesHelper );

    // add text of keys to axes
    const loader = new THREE.FontLoader();
    const font = loader.parse( helvetiker_regular);
    const cubes = getCubes(scene);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const cube = cubes[i];
        const fontSize = getCubeWidthByCube(cube) / key.length;
        const fontDepth = fontSize / 8;
        const geometry = new THREE.TextGeometry( key, {
            font: font,
            size: fontSize,
            height: fontDepth,
        });
        const material = new THREE.MeshPhongMaterial({color: defaultTextColorBlue});
        const text = new THREE.Mesh( geometry, material );
        text.geometry.computeBoundingBox();
        const textWidth = text.geometry.boundingBox.max.x;
        text.position.set(...getPositionOfKeyByCube(cubes[i], -textWidth / 2, fontDepth));
        scene.add(text);
    }
};

export const addValuesToScene = (scene, values) => {
    const valueTextList = values.map(v => v.toString());
    const loader = new THREE.FontLoader();
    const font = loader.parse( helvetiker_regular);
    const cubes = getCubes(scene);
    const valueTextMaxLength = Math.max(...valueTextList.map(v => v.length));
    const fontSize = getCubeWidthByCube(cubes[0]) / valueTextMaxLength;
    const fontDepth = fontSize / 8;

    for (let i = 0; i < values.length; ++i) {
        const valueText = valueTextList[i];
        const cube = cubes[i];

        const geometry = new THREE.TextGeometry( valueText, {
            font: font,
            size: fontSize,
            height: fontDepth,
        });
        const material = new THREE.MeshPhongMaterial({color: defaultTextColorBlue});
        const text = new THREE.Mesh( geometry, material );
        text.geometry.computeBoundingBox();
        const textWidth = text.geometry.boundingBox.max.x;
        text.position.set(...getPositionOfValueByCube(cube, -textWidth / 2));
        scene.add(text);
    }
};

/**
 * @param scene
 * @return {Array<THREE.Mesh>}
 */
export const getCubes = (scene) => {
    return scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
};

export const highlightCubeInFullWindowWithPerspectiveCamera = (scene, camera, raycaster, pointer, defaultColor = defaultCubeColorRed) => {
    raycaster.setFromCamera( pointer, camera );

    const cubes = getCubes(scene);
    if (cubes.length > 0) {
        cubes.forEach(cube => cube.material.color.set(defaultColor));
        const intersects = raycaster.intersectObjects(cubes, true);
        if (intersects.length > 0) {
            intersects[0].object.material.color.set(defaultCubeHighlightColorWhite);
        }
    }
};

export const getCubeWidthByCube = (cube) => {
    cube.geometry.computeBoundingBox();
    const boundingBox = cube.geometry.boundingBox;
    return boundingBox.max.x - boundingBox.min.x;
};