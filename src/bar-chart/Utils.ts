import helvetiker_regular from "../helvetiker_regular.typeface.json";
import { colormap } from "../CommonAlgorithms";
import ICube from '../type/ICube';
import {
    AmbientLight,
    AxesHelper,
    BoxGeometry,
    DirectionalLight,
    DoubleSide,
    Font,
    FontLoader,
    Mesh,
    MeshLambertMaterial,
    MeshPhongMaterial,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    TextGeometry,
    Vector3
} from 'three';
import { defaultLightColorWhite, defaultPlaneColorGray, defaultTextColorBlue } from '../Constant';
import { getCubes } from '../CommonUtils';
import {
    getCubeWidthByValues,
    getPositionOfKeyByCube,
    getPositionOfKeyOnTopByCube,
    getPositionOfNthBar,
    getPositionOfValueByCube
} from './Algorithms';

export const addLightToScene = (scene: Scene) => {
    const light = new DirectionalLight(defaultLightColorWhite, 1);
    light.position.set(1, 1, 2); // 平行光从右上前方射过来

    scene.add(light);
    scene.add(new AmbientLight(defaultLightColorWhite, 0.5)); // 环境光
};

export const addPlaneToScene = (scene: Scene) => {
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
    const plane = new Mesh(
        new PlaneGeometry(planeWidth, planeWidth),
        new MeshLambertMaterial({
            color: defaultPlaneColorGray,
            side: DoubleSide,
        })
    );
    // 因为plane默认在xy平面上, 需要把它旋转到xz平面上
    plane.rotateOnWorldAxis(new Vector3(1, 0, 0), -Math.PI / 2); // 在世界空间中将plane绕x轴顺时针旋转90度
    plane.position.y = -planeWidth / 10000;
    plane.name = 'planeMesh'; // for find plane mesh in scene;
    scene.add(plane);
};

export const addCubesToScene = (scene: Scene, values: Array<number>, baseLineIndex: number = 0,
                                cubeWidth: number = null, maxValue: number = null, minValue: number = null) => {
    // set default value
    cubeWidth = cubeWidth || getCubeWidthByValues(values);
    maxValue = maxValue || Math.max(...values);
    minValue = minValue || Math.min(...values);

    const colors = colormap(100);
    for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        const colorIndex = Math.round((value - minValue) / (maxValue - minValue) * 99); // colorIndex = 0, 1, 2, ..., 99
        const color = colors[colorIndex];

        const cube = new Mesh(
            new BoxGeometry(cubeWidth, value, cubeWidth),
            new MeshPhongMaterial({color, side: DoubleSide}),
        ) as ICube;
        cube.name = 'cubeMesh-' + value;
        cube.geometry.computeBoundingBox(); // 计算当前几何体的的边界矩形，更新cube.geometry.boundingBox; 边界矩形不会默认计算，默认为null
        cube.defaultColor = color; // store default color in cube mesh object
        cube.baseLineIndex = baseLineIndex; // store baseLineIndex in cube mesh object
        cube.position.set(...getPositionOfNthBar(i, value, cubeWidth, baseLineIndex));
        scene.add(cube);
    }
};

export const getOrthographicCamera = (scene: Scene, container: HTMLElement) => {
    const aspectRatio = container.offsetWidth / container.offsetHeight;

    const planeWidth = getPlaneWidthFromScene(scene);
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

export const addKeysToScene = (scene: Scene, keys: Array<string>, keyMaxLength: number, baseLineIndex = 0) => {
    const loader = new FontLoader();
    // ttf to json, see: https://gero3.github.io/facetype.js/
    // load font async, because Alibaba_PuHuiTi_Regular.json is too large
    loader.load('/Alibaba_PuHuiTi_Regular.json', font => {
        const cubesInBaseLine = getCubesInBaseLine(scene, baseLineIndex);
        const cubeWidth = getCubeWidthByCube(cubesInBaseLine[0]);
        const charWidth = cubeWidth / keyMaxLength;
        const fontDepth = charWidth / 8; // 3D font thickness

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const cube = cubesInBaseLine[i];
            const geometry = _createTextGeometry(key, font, charWidth, fontDepth);
            const material = _createTextMaterial();
            const text = new Mesh(geometry, material);
            // Chinese font's bottom will go through the plane if no offsetY
            // text.position means its top left back corner
            text.position.set(...getPositionOfKeyByCube(cube, cubeWidth, charWidth / 8, fontDepth));
            scene.add(text);
            cube.keyMeshId = text.id;
        }
    });
};

export const addKeysOnTopToScene = (scene: Scene, keys: Array<string>, keyMaxLength: number, baseLineIndex = 0) => {
    const loader = new FontLoader();
    // ttf to json, see: https://gero3.github.io/facetype.js/
    // load font async, because Alibaba_PuHuiTi_Regular.json is too large
    loader.load('/Alibaba_PuHuiTi_Regular.json', font => {
        const cubes = getCubes(scene);
        const cubesInBaseLine = getCubesInBaseLine(scene, baseLineIndex);
        const charWidth = getCubeWidthByCube(cubes[0]) / keyMaxLength;
        const fontDepth = charWidth / 8;

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const cube = cubesInBaseLine[i];
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

export const addValuesToScene = (scene: Scene, values: Array<number>, valueMaxLength: number, baseLineIndex = 0) => {
    const loader = new FontLoader();
    const font = loader.parse(helvetiker_regular);
    const cubes = getCubes(scene);
    const charWidth = getCubeWidthByCube(cubes[0]) / valueMaxLength;
    const fontDepth = charWidth / 8;
    const cubesInBaseLine = getCubesInBaseLine(scene, baseLineIndex);

    for (let i = 0; i < values.length; ++i) {
        const valueText = values[i].toString();
        const cube = cubesInBaseLine[i];

        const geometry = _createTextGeometry(valueText, font, charWidth, fontDepth);
        const material = _createTextMaterial();
        const textMesh = new Mesh(geometry, material);

        textMesh.position.set(...getPositionOfValueByCube(cube));
        scene.add(textMesh);
        cube.valueMeshId = textMesh.id;
    }
};

export const getCubeWidthByCube = (cube: ICube): number => {
    const boundingBox = cube.geometry.boundingBox;
    return boundingBox.max.x - boundingBox.min.x;
};

export const getPlaneWidthFromScene = (scene: Scene): number => {
    let planeWidth = 100;
    const planeMesh = scene.getObjectByName('planeMesh') as Mesh<PlaneGeometry, MeshLambertMaterial>;
    if (planeMesh) {
        planeWidth = planeMesh.geometry.parameters.width
    } else {
        // when no plane, use max value * value length instead
        const cubes = getCubes(scene);
        const values = cubes.map(getValueByCube);
        planeWidth = Math.max(...values) * values.length;
    }
    return planeWidth;
};

export const getCubesInBaseLine = (scene: Scene, baseLineIndex: number): Array<ICube> => {
    const cubes = getCubes(scene);
    return cubes.filter(cube => cube.baseLineIndex === baseLineIndex);
};

export const getValueByCube = (cube: ICube): number => {
    const boundingBox = cube.geometry.boundingBox;
    return boundingBox.max.y - boundingBox.min.y; // value = cube height
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

