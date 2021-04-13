import * as THREE from "three";
import Constant from "./constant";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";


export default class Utils {
    static getRenderer = () => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        return renderer;
    };

    static addLightToScene = (scene) => {
        const light = new THREE.DirectionalLight(Constant.defaultLightColorWhite, 1);
        light.position.set(1, 1, 2);

        scene.add(light);
        scene.add(new THREE.AmbientLight(Constant.defaultLightColorWhite, 0.4));
    };

    static addControlsToCamera = (camera, renderer) => {
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
}