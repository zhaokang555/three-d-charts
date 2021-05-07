import * as THREE from "three";
import BarChartAlgorithms from  "./bar-chart-algorithms";
import Constant from "../constant";
import helvetiker_regular from "../helvetiker_regular.typeface.json";
import colormap from "colormap";

export default class BarChartUtils {
    static addLightToScene = (scene) => {
        const light = new THREE.DirectionalLight(Constant.defaultLightColorWhite, 1);
        light.position.set(1, 1, 2); // 平行光从右上前方射过来

        scene.add(light);
        scene.add(new THREE.AmbientLight(Constant.defaultLightColorWhite, 0.4)); // 环境光
    };

    static addPlaneToScene = (scene) => {
        let planeWidth = 100;
        const cubes = this.getCubes(scene);
        const cubePositions = cubes.map(cube => cube.position);
        if (cubePositions.length > 0) {
            // 根据最右边cube的x坐标 和 最高cube的高度 来确定planeWidth
            const maxX = Math.max(...cubePositions.map(p => Math.abs(p.x)));
            const maxZ = Math.max(...cubePositions.map(p => Math.abs(p.z)));
            const maxXZ = Math.max(maxX, maxZ);
            const maxY = Math.max(...cubePositions.map(p => Math.abs(p.y * 2)));
            const planeWidthByMaxXZ = maxXZ * 2 + this.getCubeWidthByCube(cubes[0]);
            if (planeWidthByMaxXZ > maxY) {
                planeWidth = maxXZ * 2 + this.getCubeWidthByCube(cubes[0]);
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
     * @param cubeWidth
     */
    static addCubesToScene = (scene, values, baseLineIndex = 0, cubeWidth) => {
        cubeWidth = cubeWidth || BarChartAlgorithms.getCubeWidthByValues(values);
        // bigger value has a darker color, see: https://github.com/bpostlethwaite/colormap
        const colors = colormap({colormap: 'hot', nshades: 200}).slice(50, 150); // do not use color which is too light or too dark
        const maxValue = Math.max(...values);

        for (let i = 0; i < values.length; ++i) {
            const value = values[i];
            const colorIndex = Math.round(value / maxValue * 99); // colorIndex = 0, 1, 2, ..., 99
            const color = colors[colorIndex];

            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(cubeWidth, value, cubeWidth),
                new THREE.MeshPhongMaterial({
                    // color: Constant.defaultCubeColorRed,
                    color,
                    specular: 0xffffff,
                    shininess: 100,
                    side: THREE.DoubleSide,
                }),
            );
            cube.defaultColor = color; // store default color in cube mesh object
            cube.baseLineIndex = baseLineIndex; // store baseLineIndex in cube mesh object
            cube.position.set(...BarChartAlgorithms.getPositionOfNthBar(i, value, cubeWidth, baseLineIndex));
            scene.add(cube);
        }
    };

    static getOrthographicCamera = (scene) => {
        const ratio = window.innerWidth / window.innerHeight;

        const planeWidth = this.getPlaneWidthFromScene(scene);
        const x = planeWidth / 2 * 1.415;
        const y = x / ratio;
        const camera = new THREE.OrthographicCamera(-x, x, y, -y, -planeWidth * 4, planeWidth * 4);

        camera.position.set(-x / 2, x / 2, x); // see from left-front-top position
        // camera.lookAt(0, 0, 0);
        return camera;
    };

    static getPerspectiveCamera = (scene) => {
        const planeWidth = this.getPlaneWidthFromScene(scene);
        const x = planeWidth / 2 * 1.732;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, planeWidth * 4);
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
            const cubesInBaseLine = this.getCubesInBaseLine(scene, baseLineIndex);
            const cubeWidth = this.getCubeWidthByCube(cubesInBaseLine[0]);
            const charWidth = cubeWidth / keyMaxlength;
            const fontDepth = charWidth / 8; // 3D font thickness

            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const cube = cubesInBaseLine[i];
                const geometry = new THREE.TextGeometry( key, {
                    font: font,
                    size: charWidth,
                    height: fontDepth,
                });
                geometry.computeBoundingBox();
                const textWidth = geometry.boundingBox.max.x;

                const material = new THREE.MeshPhongMaterial({color: Constant.defaultTextColorBlue});
                const text = new THREE.Mesh( geometry, material );
                // Chinese font's bottom will go through the plane if no offsetY
                // text.position means its top left back corner
                text.position.set(...BarChartAlgorithms.getPositionOfKeyByCube(cube, cubeWidth, -textWidth / 2, charWidth / 8, fontDepth));
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
            const cubes = this.getCubes(scene);
            const cubesInBaseLine = BarChartUtils.getCubesInBaseLine(scene, baseLineIndex);
            const charWidth = this.getCubeWidthByCube(cubes[0]) / keyMaxlength;
            const fontDepth = charWidth / 8;

            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const cube = cubesInBaseLine[i];
                const geometry = new THREE.TextGeometry( key, {
                    font: font,
                    size: charWidth,
                    height: fontDepth,
                });
                geometry.computeBoundingBox();
                const textWidth = geometry.boundingBox.max.x;

                const material = new THREE.MeshPhongMaterial({color: Constant.defaultTextColorBlue});

                const text = new THREE.Mesh( geometry, material );

                const valueMesh = scene.getObjectById(cube.valueMeshId);
                const valueMeshHeight = valueMesh.geometry.boundingBox.max.y - valueMesh.geometry.boundingBox.min.y;

                text.position.set(...BarChartAlgorithms.getPositionOfKeyOnTopByCube(cube, -textWidth / 2, valueMeshHeight));
                // text.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2); // 在世界空间中将text绕x轴顺时针旋转90度
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
        const valueTextList = values.map(v => v.toString());
        const loader = new THREE.FontLoader();
        const font = loader.parse(helvetiker_regular);
        const cubes = this.getCubes(scene);
        const charWidth = this.getCubeWidthByCube(cubes[0]) / valueMaxLength;
        const fontDepth = charWidth / 8;
        const cubesInBaseLine = BarChartUtils.getCubesInBaseLine(scene, baseLineIndex);

        for (let i = 0; i < values.length; ++i) {
            const valueText = valueTextList[i];
            const cube = cubesInBaseLine[i];

            const geometry = new THREE.TextGeometry( valueText, {
                font: font,
                size: charWidth,
                height: fontDepth,
            });
            const material = new THREE.MeshPhongMaterial({color: Constant.defaultTextColorBlue});
            const text = new THREE.Mesh( geometry, material );
            text.geometry.computeBoundingBox();
            const textWidth = text.geometry.boundingBox.max.x;
            text.position.set(...BarChartAlgorithms.getPositionOfValueByCube(cube, -textWidth / 2));
            scene.add(text);
            cube.valueMeshId = text.id;
        }
    };

    /**
     * @param scene: THREE.Scene
     * @param camera: THREE.Camera
     * @param raycaster: THREE.Raycaster
     * @param pointer: THREE.Vector2
     */
    static highlightCubeInFullWindow = (scene, camera, raycaster, pointer) => {
        raycaster.setFromCamera( pointer, camera );

        const cubes = this.getCubes(scene);
        if (cubes.length > 0) {
            cubes.forEach(cube => {
                const defaultColor = cube.defaultColor || Constant.defaultCubeColorRed;
                cube.material.color.set(defaultColor);
                const keyMesh = scene.getObjectById(cube.keyMeshId);
                const valueMesh = scene.getObjectById(cube.valueMeshId);
                keyMesh && keyMesh.material.color.set(Constant.defaultTextColorBlue);
                valueMesh && valueMesh.material.color.set(Constant.defaultTextColorBlue);
            });
            const intersects = raycaster.intersectObjects(cubes, true);
            if (intersects.length > 0) {
                const cube = intersects[0].object;
                cube.material.color.set(Constant.defaultCubeHighlightColorWhite);
                const keyMesh = scene.getObjectById(cube.keyMeshId);
                const valueMesh = scene.getObjectById(cube.valueMeshId);
                keyMesh && keyMesh.material.color.set(Constant.defaultTextHighlightColorRed);
                valueMesh && valueMesh.material.color.set(Constant.defaultTextHighlightColorRed);
            }
        }
    };

    static getCubeWidthByCube = (cube) => {
        cube.geometry.computeBoundingBox();
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
        }
        return planeWidth;
    };

    static getCubes = (scene) => {
        return scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
    };

    /**
     * @param scene
     * @param baseLineIndex: number 第几排柱子
     * @return {THREE.Mesh[]}
     */
    static getCubesInBaseLine = (scene, baseLineIndex) => {
        const cubes = this.getCubes(scene);
        return cubes.filter(cube => cube.baseLineIndex === baseLineIndex);
    };
}
