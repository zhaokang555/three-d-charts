import * as THREE from "three";
import Constant from "../constant";
import BarChartAlgorithms from "./bar-chart-algorithms";
import BarChartUtils from "./bar-chart-utils";

export default class BarChart2ArgumentsUtils {
    static addKeysToScene = (scene, keys, baseLineIndex = 0) => {
        const loader = new THREE.FontLoader();
        // ttf to json, see: https://gero3.github.io/facetype.js/
        // load font async, because Alibaba_PuHuiTi_Regular.json is too large
        loader.load('/Alibaba_PuHuiTi_Regular.json', font => {
            const cubes = BarChartUtils.getCubes(scene, baseLineIndex);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const cube = cubes[i];
                const cubeWidth = BarChartUtils.getCubeWidthByCube(cube);
                const [geometry] = BarChartUtils.getTextGeometryAndTextWidthWhichSameWithCubeWidth(key, font, cube);
                const material = new THREE.MeshPhongMaterial({color: Constant.defaultTextColorBlue});
                const text = new THREE.Mesh( geometry, material );
                // Chinese font's bottom will go through the plane if no offsetY
                // text.position means its top left front corner
                text.position.set(...BarChartAlgorithms.getPositionOfKeyOnTopByCube(cubes[i], cubeWidth));
                text.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2); // 在世界空间中将text绕x轴顺时针旋转90度
                scene.add(text);
            }
        });
    };
};