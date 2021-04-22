import * as THREE from "three";
import BarChartAlgorithms from  "./bar-chart-algorithms";
import Constant from "../constant";
import helvetiker_regular from "../helvetiker_regular.typeface.json";
import colormap from "colormap";

export default class BarChartUtils {
    static addLightToScene = (scene) => {
        const light = new THREE.DirectionalLight(Constant.defaultLightColorWhite, 1);
        light.position.set(1, 1, 2);

        scene.add(light);
        scene.add(new THREE.AmbientLight(Constant.defaultLightColorWhite, 0.4));
    };

    static addPlaneToScene = (scene) => {
        let planeWidth = 100;
        const cubes = this._getCubes(scene);
        const cubePositions = cubes.map(cube => cube.position);
        if (cubePositions.length > 0) {
            const maxX = Math.max(...cubePositions.map(p => Math.abs(p.x)));
            const maxZ = Math.max(...cubePositions.map(p => Math.abs(p.y * 2)));
            planeWidth = Math.max(maxX, maxZ) * 2 + BarChartUtils.getCubeWidthByCube(cubes[0]);
        }
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeWidth, planeWidth),
            new THREE.MeshLambertMaterial({
                color: Constant.defaultPlaneColorGray,
                side: THREE.DoubleSide,
            })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0;
        plane.name = 'planeMesh'; // for find plane mesh in scene;
        scene.add(plane);
    };

    /**
     * @param scene: THREE.Scene
     * @param values: Array<number>
     */
    static addCubesToScene = (scene, values) => {
        const cubeWidth = BarChartAlgorithms.getCubeWidthByValues(values);
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
            cube.position.set(...BarChartAlgorithms.getPositionOfNthBar(i, value, cubeWidth));
            scene.add(cube);
        }
    };

    static getOrthographicCamera = (scene) => {
        const ratio = window.innerWidth / window.innerHeight;

        const planeWidth = this.getPlaneWidthFromScene(scene);
        const x = planeWidth / 2 * 1.415;
        const y = x / ratio;
        const camera = new THREE.OrthographicCamera(-x, x, y, -y, -planeWidth * 4, planeWidth * 4);

        camera.position.set(-x, x, x); // see from left-front-top position
        // camera.lookAt(0, 0, 0);
        window.camera = camera;
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
     */
    static addKeysToScene = (scene, keys) => {
        const loader = new THREE.FontLoader();
        // ttf to json, see: https://gero3.github.io/facetype.js/
        // load font async, because Alibaba_PuHuiTi_Regular.json is too large
        loader.load('./Alibaba_PuHuiTi_Regular.json', font => {
            const cubes = this._getCubes(scene);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const cube = cubes[i];
                const fontSize = BarChartUtils.getCubeWidthByCube(cube) / key.length;
                const fontDepth = fontSize / 8; // 3D font thickness
                const [geometry, textWidth] = this._getTextGeometryAndTextWidthWhichSameWithCubeWidth(key, font, cube);
                const material = new THREE.MeshPhongMaterial({color: Constant.defaultTextColorBlue});
                const text = new THREE.Mesh( geometry, material );
                // Chinese font's bottom will go through the plane if no offsetY
                text.position.set(...BarChartAlgorithms.getPositionOfKeyByCube(cubes[i], -textWidth / 2, fontSize / 8, fontDepth));
                scene.add(text);
            }
        });
    };

    /**
     * @param scene: THREE.Scene
     * @param values: Array<number>
     */
    static addValuesToScene = (scene, values) => {
        const valueTextList = values.map(v => v.toString());
        const loader = new THREE.FontLoader();
        const font = loader.parse( helvetiker_regular);
        const cubes = this._getCubes(scene);
        const valueTextMaxLength = Math.max(...valueTextList.map(v => v.length));
        const fontSize = BarChartUtils.getCubeWidthByCube(cubes[0]) / valueTextMaxLength;
        const fontDepth = fontSize / 8;

        for (let i = 0; i < values.length; ++i) {
            const valueText = valueTextList[i];
            const cube = cubes[i];

            const geometry = new THREE.TextGeometry( valueText, {
                font: font,
                size: fontSize,
                height: fontDepth,
            });
            const material = new THREE.MeshPhongMaterial({color: Constant.defaultTextColorBlue});
            const text = new THREE.Mesh( geometry, material );
            text.geometry.computeBoundingBox();
            const textWidth = text.geometry.boundingBox.max.x;
            text.position.set(...BarChartAlgorithms.getPositionOfValueByCube(cube, -textWidth / 2));
            scene.add(text);
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

        const cubes = this._getCubes(scene);
        if (cubes.length > 0) {
            cubes.forEach(cube => {
                const defaultColor = cube.defaultColor || Constant.defaultCubeColorRed;
                cube.material.color.set(defaultColor);
            });
            const intersects = raycaster.intersectObjects(cubes, true);
            if (intersects.length > 0) {
                intersects[0].object.material.color.set(Constant.defaultCubeHighlightColorWhite);
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

    /**
     * @param text: string
     * @param font: THREE.Font
     * @param cube: THREE.Mesh
     * @return {[TextGeometry, number]}
     * @private
     */
    static _getTextGeometryAndTextWidthWhichSameWithCubeWidth = (text, font, cube) => {
        let geometry = new THREE.TextGeometry( text, {font});
        geometry.computeBoundingBox();
        let textWidth = geometry.boundingBox.max.x;

        const fontSize = 100 / (textWidth / this.getCubeWidthByCube(cube)); // default font size is 100
        geometry = new THREE.TextGeometry(text, {
            font,
            size: fontSize,
            height: fontSize / 8,
        });
        geometry.computeBoundingBox();
        textWidth = geometry.boundingBox.max.x;

        return [geometry, textWidth];
    };

    /**
     * @param scene
     * @return {Array<THREE.Mesh>}
     * @private
     */
    static _getCubes = (scene) => {
        return scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
    };
}
