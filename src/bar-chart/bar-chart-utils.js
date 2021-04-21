import * as THREE from "three";
import BarChartAlgorithms from  "./bar-chart-algorithms";
import Constant from "../constant";
import helvetiker_regular from "../helvetiker_regular.typeface.json";

export default class BarChartUtils {
    static addLightToScene = (scene) => {
        const light = new THREE.DirectionalLight(Constant.defaultLightColorWhite, 1);
        light.position.set(1, 1, 2);

        scene.add(light);
        scene.add(new THREE.AmbientLight(Constant.defaultLightColorWhite, 0.4));
    };

    static addPlaneToScene = (scene) => {
        let planeWidth = 100;
        const cubes = BarChartUtils.getCubes(scene);
        const cubePositions = cubes.map(cube => cube.position);
        if (cubePositions.length > 0) {
            const maxX = Math.max(...cubePositions.map(p => Math.abs(p.x)));
            const maxZ = Math.max(...cubePositions.map(p => Math.abs(p.z)));
            planeWidth = Math.max(maxX, maxZ) * 2 + BarChartUtils.getCubeWidthByCube(cubes[0]);
        }
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeWidth),
            new THREE.MeshLambertMaterial({color: Constant.defaultPlaneColorGray}));
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0;
        scene.add(plane);
    };

    /**
     * @param scene: THREE.Scene
     * @param values: Array<number>
     * @param cubeWidth: number
     */
    static addCubesToScene = (scene, values) => {
        const cubeWidth = BarChartAlgorithms.getCubeWidthByValues(values);

        for (let i = 0; i < values.length; ++i) {
            const value = values[i];
            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(cubeWidth, value, cubeWidth),
                new THREE.MeshPhongMaterial({
                    color: Constant.defaultCubeColorRed,
                    specular: 0xffffff,
                    shininess: 100
                }),
            );
            cube.position.set(...BarChartAlgorithms.getPositionOfNthBar(i, value, cubeWidth));
            scene.add(cube);
        }
    };

    static getOrthographicCamera = (scene) => {
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

    static getPerspectiveCamera = (scene) => {
        let x = 100;
        const plane = scene.children.find(child => child.type === 'Mesh' && child.geometry.type === 'PlaneGeometry');
        if (plane) {
            x = plane.geometry.parameters.width / 2 * 1.732;
        }

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(x, x, x);
        camera.lookAt(0, 0, 0);
        return camera;
    };

    static addAxesToScene = (scene) => {
        const axesHelper = new THREE.AxesHelper( 1 );
        scene.add(axesHelper);
    };

    static addKeysToScene = (scene, keys) => {
        const loader = new THREE.FontLoader();
        // ttf to json, see: https://gero3.github.io/facetype.js/
        // load font async, because Alibaba_PuHuiTi_Regular.json is too large
        loader.load('./Alibaba_PuHuiTi_Regular.json', font => {
            const cubes = BarChartUtils.getCubes(scene);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const cube = cubes[i];
                const fontSize = BarChartUtils.getCubeWidthByCube(cube) / key.length;
                const fontDepth = fontSize / 8; // 3D字体厚度
                const geometry = new THREE.TextGeometry( key, {
                    font: font,
                    size: fontSize,
                    height: fontDepth,
                });
                const material = new THREE.MeshPhongMaterial({color: Constant.defaultTextColorBlue});
                const text = new THREE.Mesh( geometry, material );
                text.geometry.computeBoundingBox();
                const textWidth = text.geometry.boundingBox.max.x;
                text.position.set(...BarChartAlgorithms.getPositionOfKeyByCube(cubes[i], -textWidth / 2, fontSize / 8, fontDepth));
                scene.add(text);
            }
        });
    };

    static addValuesToScene = (scene, values) => {
        const valueTextList = values.map(v => v.toString());
        const loader = new THREE.FontLoader();
        const font = loader.parse( helvetiker_regular);
        const cubes = BarChartUtils.getCubes(scene);
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
     * @param scene
     * @return {Array<THREE.Mesh>}
     */
    static getCubes = (scene) => {
        return scene.children.filter(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry');
    };

    static highlightCubeInFullWindowWithPerspectiveCamera = (scene, camera, raycaster, pointer, defaultColor = Constant.defaultCubeColorRed) => {
        raycaster.setFromCamera( pointer, camera );

        const cubes = BarChartUtils.getCubes(scene);
        if (cubes.length > 0) {
            cubes.forEach(cube => cube.material.color.set(defaultColor));
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
}
