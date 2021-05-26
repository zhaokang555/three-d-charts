import * as THREE from 'three';

interface ICube extends THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial> {
    keyMeshId: number;
    valueMeshId: number;
    baseLineIndex: number;
    defaultColor: THREE.Color;
}

export default ICube;