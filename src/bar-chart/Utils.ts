import helvetiker_regular from "../helvetiker_regular.typeface.json";
import { colormap } from "../CommonAlgorithms";
import {
    AmbientLight,
    AxesHelper,
    DoubleSide,
    Font,
    FontLoader,
    Mesh,
    MeshLambertMaterial,
    MeshPhongMaterial,
    OrthographicCamera,
    PlaneGeometry,
    PointLight,
    Scene,
    TextGeometry,
    Vector3
} from 'three';
import { defaultLightColorWhite, defaultPlaneColorGray, defaultTextColorBlue } from '../Constant';
import { getCubes } from '../CommonUtils';
import {
    getCubeWidthByValues,
    getPositionOfKeyOnTopByCube,
    getPositionOfNthBar,
    getPositionOfValueByCube
} from './Algorithms';
import InfoPanelMesh from '../components/InfoPanelMesh';
import {BarMesh} from '../components/BarMesh';

export const addLightToScene = (scene: Scene, planeWidth: number) => {
    const light = new PointLight();
    light.position.set(0, planeWidth, 0);
    scene.add(light);

    scene.add(new AmbientLight(defaultLightColorWhite, 0.5)); // 环境光
};

export const addPlaneToScene = (scene: Scene): number => {
    let planeWidth = 100;
    const cubes = getCubes(scene);
    const cubePositions = cubes.map(cube => cube.position);
    if (cubePositions.length === 0) return;

    // 根据最右边cube的x坐标 和 最高cube的高度 来确定planeWidth
    const maxX = Math.max(...cubePositions.map(p => Math.abs(p.x)));
    const maxZ = Math.max(...cubePositions.map(p => Math.abs(p.z)));
    const maxXZ = Math.max(maxX, maxZ);
    const maxY = Math.max(...cubePositions.map(p => Math.abs(p.y * 2)));
    const planeWidthByMaxXZ = maxXZ * 2 + getCubeWidthByCube(cubes[0]);
    if (planeWidthByMaxXZ > maxY) {
        planeWidth = maxXZ * 2 + getCubeWidthByCube(cubes[0]);
    } else {
        planeWidth = maxY;
    }
    const planeMesh = new Mesh(
        new PlaneGeometry(planeWidth, planeWidth),
        new MeshLambertMaterial({
            color: defaultPlaneColorGray,
            side: DoubleSide,
        })
    );
    // 因为plane默认在xy平面上, 需要把它旋转到xz平面上
    planeMesh.rotateOnWorldAxis(new Vector3(1, 0, 0), -Math.PI / 2); // 在世界空间中将plane绕x轴顺时针旋转90度
    planeMesh.position.y = -planeWidth / 10000;
    planeMesh.name = 'planeMesh'; // for find plane mesh in scene;
    scene.add(planeMesh);

    return planeWidth;
};

export const addCubesToScene = (scene: Scene, values: Array<number>, baseLineIndex: number = 0, cubeWidth: number = null,
                                maxValue: number = null, minValue: number = null): Array<BarMesh> => {
    // set default value
    cubeWidth = cubeWidth || getCubeWidthByValues(values);
    maxValue = maxValue || Math.max(...values);
    minValue = minValue || Math.min(...values);

    const colors = colormap(100);
    const cubes = [];
    for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        const colorIndex = Math.round((value - minValue) / (maxValue - minValue) * 99); // colorIndex = 0, 1, 2, ..., 99
        const color = colors[colorIndex];

        const cube = new BarMesh(cubeWidth, value, color);
        cube.baseLineIndex = baseLineIndex; // store baseLineIndex in cube mesh object
        cube.position.set(...getPositionOfNthBar(i, value, cubeWidth, baseLineIndex));
        scene.add(cube);
        cubes.push(cube);
    }

    return cubes;
};

export const getOrthographicCamera = (scene: Scene, container: HTMLElement, planeWidth: number) => {
    const aspectRatio = container.offsetWidth / container.offsetHeight;

    const x = planeWidth / 2 * 1.415;
    const y = x / aspectRatio;
    const camera = new OrthographicCamera(-x, x, y, -y, -planeWidth * 4, planeWidth * 4);

    camera.position.set(-x / 2, x / 2, x); // see from left-front-top position
    // camera.lookAt(0, 0, 0);
    return camera;
};

export const addAxesToScene = (scene: Scene) => {
    const axesHelper = new AxesHelper(1000000);
    axesHelper.visible = false;
    axesHelper.name = 'axesHelper';
    scene.add(axesHelper);
};

export const addKeysOnTopToScene = (scene: Scene, keys: Array<string>, keyMaxLength: number, cubes: Array<BarMesh>) => {
    const loader = new FontLoader();
    // ttf to json, see: https://gero3.github.io/facetype.js/
    // load font async, because Alibaba_PuHuiTi_Regular.json is too large
    loader.load('/Alibaba_PuHuiTi_Regular.json', font => {
        const charWidth = getCubeWidthByCube(cubes[0]) / keyMaxLength;
        const fontDepth = charWidth / 8;

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const cube = cubes[i];
            const geometry = _createTextGeometry(key, font, charWidth, fontDepth);
            const material = _createTextMaterial();
            const text = new Mesh(geometry, material);

            const valueMesh = scene.getObjectById(cube.valueMeshId) as Mesh<TextGeometry, MeshPhongMaterial>;
            const valueMeshHeight = valueMesh.geometry.boundingBox.max.y - valueMesh.geometry.boundingBox.min.y;

            text.position.set(...getPositionOfKeyOnTopByCube(cube, valueMeshHeight * 2));
            scene.add(text);
            cube.keyMeshId = text.id;
        }
    });
};

export const addValuesToScene = (scene: Scene, values: Array<number>, valueMaxLength: number = 0, cubes: Array<BarMesh>) => {
    const loader = new FontLoader();
    const font = loader.parse(helvetiker_regular);
    const charWidth = getCubeWidthByCube(cubes[0]) / valueMaxLength;
    const fontDepth = charWidth / 8;

    for (let i = 0; i < values.length; ++i) {
        const valueText = values[i].toString();
        const cube = cubes[i];

        const geometry = _createTextGeometry(valueText, font, charWidth, fontDepth);
        const material = _createTextMaterial();
        const textMesh = new Mesh(geometry, material);

        textMesh.position.set(...getPositionOfValueByCube(cube));
        scene.add(textMesh);
        cube.valueMeshId = textMesh.id;
    }
};

export const getCubeWidthByCube = (cube: BarMesh): number => {
    const boundingBox = cube.geometry.boundingBox;
    return boundingBox.max.x - boundingBox.min.x;
};

export const getValueByCube = (cube: BarMesh): number => {
    const boundingBox = cube.geometry.boundingBox;
    return boundingBox.max.y - boundingBox.min.y; // value = cube height
};

export const addInfoPanelToScene = (scene: Scene, key: string, value: number, cube: BarMesh) => {
    const cubeWidth = getCubeWidthByCube(cube);
    const {x, z} = cube.position;
    const infoPanelSize = cubeWidth * 0.7;
    const infoPanelMesh = new InfoPanelMesh(infoPanelSize, key, value);
    infoPanelMesh.position.set(x, value + infoPanelSize / 2, z);
    scene.add(infoPanelMesh);
    return infoPanelMesh;
};

const _createTextGeometry = (text: string, font: Font, size: number, fontDepth: number): TextGeometry => {
    const geometry = new TextGeometry(text, {
        font,
        size,
        height: fontDepth,
    });
    geometry.center(); // has called geometry.computeBoundingBox() in center()
    geometry.translate(0, geometry.boundingBox.max.y, 0); // 向上移动半个自身高度，防止字体埋在cube里/plane里
    // after translate, geometry.boundingBox.min.y = 0 and geometry.boundingBox.max.y = height
    // NOTE: do not call center() again after translate, it will make geometry.boundingBox.min.y = -height/2 and geometry.boundingBox.max.y = height/2
    return geometry;
};

const _createTextMaterial = () => {
    return new MeshPhongMaterial({
        color: defaultTextColorBlue,
        // specular: defaultTextColorBlue, // 高光颜色
        emissive: defaultTextColorBlue, // 自发光
        emissiveIntensity: 0.8,
    });
};
