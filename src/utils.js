import * as THREE from "three";

export default class Utils {
    static getRenderer = () => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        return renderer;
    };
}