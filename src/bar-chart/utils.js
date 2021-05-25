import * as THREE from "three";
import Algorithms from "./algorithms";
import Constant from "../constant";
import helvetiker_regular from "../helvetiker_regular.typeface.json";
import {colormap} from "../common-algorithms";
import CommonUtils from "../common-utils";

export default class Utils {
    static addLightToScene = (scene) => {
        const light = new THREE.DirectionalLight(Constant.defaultLightColorWhite, 1);
        light.position.set(1, 1, 2); // 平行光从右上前方射过来

        scene.add(light);
        scene.add(new THREE.AmbientLight(Constant.defaultLightColorWhite, 0.5)); // 环境光
    };

    static addPlaneToScene = (scene) => {
        let planeWidth = 100;
        const cubes = CommonUtils.getCubes(scene);
        const cubePositions = cubes.map(cube => cube.position);
        if (cubePositions.length > 0) {
            // 根据最右边cube的x坐标 和 最高cube的高度 来确定planeWidth
            const maxX = Math.max(...cubePositions.map(p => Math.abs(p.x)));
            const maxZ = Math.max(...cubePositions.map(p => Math.abs(p.z)));
            const maxXZ = Math.max(maxX, maxZ);
            const maxY = Math.max(...cubePositions.map(p => Math.abs(p.y * 2)));
            const planeWidthByMaxXZ = maxXZ * 2 + Utils.getCubeWidthByCube(cubes[0]);
            if (planeWidthByMaxXZ > maxY) {
                planeWidth = maxXZ * 2 + Utils.getCubeWidthByCube(cubes[0]);
            } else {
                planeWidth = maxY;
            }
        }
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeWidth, planeWidth),
            new THREE.MeshLambertMaterial({
                color: Constant.defaultPlaneColorGray,
                side: THREE.DoubleSide,
            })
        );
        // 因为plane默认在xy平面上, 需要把它旋转到xz平面上
        plane.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2); // 在世界空间中将plane绕x轴顺时针旋转90度
        plane.name = 'planeMesh'; // for find plane mesh in scene;
        scene.add(plane);
    };

    /**
     * @param scene: THREE.Scene
     * @param values: Array<number>
     * @param baseLineIndex: number 第几排柱子
     * @param cubeWidth: number
     * @param maxValue: number
     * @param minValue: number
     */
    static addCubesToScene = (scene, values, baseLineIndex = 0, cubeWidth, maxValue, minValue) => {
        // set default value
        cubeWidth = cubeWidth || Algorithms.getCubeWidthByValues(values);
        maxValue = maxValue || Math.max(...values);
        minValue = minValue || Math.min(...values);

        const colors = colormap(100);
        for (let i = 0; i < values.length; ++i) {
            const value = values[i];
            const colorIndex = Math.round((value - minValue) / (maxValue - minValue) * 99); // colorIndex = 0, 1, 2, ..., 99
            const color = colors[colorIndex];

            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(cubeWidth, value, cubeWidth),
                new THREE.MeshPhongMaterial({color, side: THREE.DoubleSide}),
            );
            cube.name = 'cubeMesh-' + value;
            cube.geometry.computeBoundingBox(); // 计算当前几何体的的边界矩形，更新cube.geometry.boundingBox; 边界矩形不会默认计算，默认为null
            cube.defaultColor = color; // store default color in cube mesh object
            cube.baseLineIndex = baseLineIndex; // store baseLineIndex in cube mesh object
            cube.position.set(...Algorithms.getPositionOfNthBar(i, value, cubeWidth, baseLineIndex));
            scene.add(cube);
        }
    };

    static getOrthographicCamera = (scene, container) => {
        const ratio = container.offsetWidth / container.offsetHeight;

        const planeWidth = Utils.getPlaneWidthFromScene(scene);
        const x = planeWidth / 2 * 1.415;
        const y = x / ratio;
        const camera = new THREE.OrthographicCamera(-x, x, y, -y, -planeWidth * 4, planeWidth * 4);

        camera.position.set(-x / 2, x / 2, x); // see from left-front-top position
        // camera.lookAt(0, 0, 0);
        return camera;
    };

    static getPerspectiveCamera = (scene, container) => {
        const planeWidth = Utils.getPlaneWidthFromScene(scene);
        const x = planeWidth / 2 * 1.732;

        const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, planeWidth * 4);
        camera.position.set(x, x, x);
        camera.lookAt(0, 0, 0);
        return camera;
    };

    static addAxesToScene = (scene) => {
        const axesHelper = new THREE.AxesHelper( 1 );
        scene.add(axesHelper);
    };

    /**
     * @param scene: THREE.Scene
     * @param keys: Array<string>
     * @param keyMaxlength
     * @param baseLineIndex
     */
    static addKeysToScene = (scene, keys, keyMaxlength, baseLineIndex = 0) => {
        const loader = new THREE.FontLoader();
        // ttf to json, see: https://gero3.github.io/facetype.js/
        // load font async, because Alibaba_PuHuiTi_Regular.json is too large
        loader.load('/Alibaba_PuHuiTi_Regular.json', font => {
            const cubesInBaseLine = Utils.getCubesInBaseLine(scene, baseLineIndex);
            const cubeWidth = Utils.getCubeWidthByCube(cubesInBaseLine[0]);
            const charWidth = cubeWidth / keyMaxlength;
            const fontDepth = charWidth / 8; // 3D font thickness

            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const cube = cubesInBaseLine[i];
                const geometry = Utils._createTextGeometry(key, font, charWidth, fontDepth);
                const material = Utils._createTextMaterial();
                const text = new THREE.Mesh( geometry, material );
                // Chinese font's bottom will go through the plane if no offsetY
                // text.position means its top left back corner
                text.position.set(...Algorithms.getPositionOfKeyByCube(cube, cubeWidth, charWidth / 8, fontDepth));
                scene.add(text);
                cube.keyMeshId = text.id;
            }
        });
    };

    /**
     * @param scene
     * @param keys: Array<string>
     * @param keyMaxlength: number
     * @param baseLineIndex: number
     */
    static addKeysOnTopToScene = (scene, keys, keyMaxlength, baseLineIndex = 0) => {
        const loader = new THREE.FontLoader();
        // ttf to json, see: https://gero3.github.io/facetype.js/
        // load font async, because Alibaba_PuHuiTi_Regular.json is too large
        loader.load('/Alibaba_PuHuiTi_Regular.json', font => {
            const cubes = CommonUtils.getCubes(scene);
            const cubesInBaseLine = Utils.getCubesInBaseLine(scene, baseLineIndex);
            const charWidth = Utils.getCubeWidthByCube(cubes[0]) / keyMaxlength;
            const fontDepth = charWidth / 8;

            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const cube = cubesInBaseLine[i];
                const geometry = Utils._createTextGeometry(key, font, charWidth, fontDepth);
                const material = Utils._createTextMaterial();
                const text = new THREE.Mesh( geometry, material );

                const valueMesh = scene.getObjectById(cube.valueMeshId);
                const valueMeshHeight = valueMesh.geometry.boundingBox.max.y - valueMesh.geometry.boundingBox.min.y;

                text.position.set(...Algorithms.getPositionOfKeyOnTopByCube(cube, valueMeshHeight * 2));
                scene.add(text);
                cube.keyMeshId = text.id;
            }
        });
    };

    /**
     * @param scene: THREE.Scene
     * @param values: Array<number>
     * @param valueMaxLength
     * @param baseLineIndex
     */
    static addValuesToScene = (scene, values, valueMaxLength, baseLineIndex = 0) => {
        const loader = new THREE.FontLoader();
        const font = loader.parse(helvetiker_regular);
        const cubes = CommonUtils.getCubes(scene);
        const charWidth = Utils.getCubeWidthByCube(cubes[0]) / valueMaxLength;
        const fontDepth = charWidth / 8;
        const cubesInBaseLine = Utils.getCubesInBaseLine(scene, baseLineIndex);

        for (let i = 0; i < values.length; ++i) {
            const valueText = values[i].toString();
            const cube = cubesInBaseLine[i];

            const geometry = Utils._createTextGeometry(valueText, font, charWidth, fontDepth);
            const material = Utils._createTextMaterial();
            const textMesh = new THREE.Mesh(geometry, material);

            textMesh.position.set(...Algorithms.getPositionOfValueByCube(cube));
            scene.add(textMesh);
            cube.valueMeshId = textMesh.id;
        }
    };

    static getCubeWidthByCube = (cube) => {
        const boundingBox = cube.geometry.boundingBox;
        return boundingBox.max.x - boundingBox.min.x;
    };

    /**
     * @param scene
     * @return {number}
     */
    static getPlaneWidthFromScene = (scene) => {
        let planeWidth = 100;
        const planeMesh = scene.getObjectByName('planeMesh');
        if (planeMesh) {
            planeWidth = planeMesh.geometry.parameters.width
        } else {
            // when no plane, use max value * value length instead
            const cubes = CommonUtils.getCubes(scene);
            const values = cubes.map(Utils.getValueByCube);
            planeWidth = Math.max(...values) * values.length;
        }
        return planeWidth;
    };

    /**
     * @param scene
     * @param baseLineIndex: number 第几排柱子
     * @return {THREE.Mesh[]}
     */
    static getCubesInBaseLine = (scene, baseLineIndex) => {
        const cubes = CommonUtils.getCubes(scene);
        return cubes.filter(cube => cube.baseLineIndex === baseLineIndex);
    };

    /**
     * @param cube: THREE.Mesh
     * @return {number}
     */
    static getValueByCube = (cube) => {
        const boundingBox = cube.geometry.boundingBox;
        return boundingBox.max.y - boundingBox.min.y; // value = cube height
    };

    /**
     * @param text: string
     * @param font: THREE.Font
     * @param size: number
     * @param fontDepth: number
     * @return {TextGeometry}
     */
    static _createTextGeometry = (text, font, size, fontDepth) => {
        const geometry = new THREE.TextGeometry( text, {
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

    static _createTextMaterial = () => {
        return new THREE.MeshPhongMaterial({
            color: Constant.defaultTextColorBlue,
            // specular: Constant.defaultTextColorBlue, // 高光颜色
            emissive: Constant.defaultTextColorBlue, // 自发光
            emissiveIntensity: 0.8,
        });
    };
}
