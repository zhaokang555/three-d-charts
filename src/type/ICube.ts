import { BoxGeometry, Color, Mesh, MeshPhongMaterial } from 'three';

interface ICube extends Mesh<BoxGeometry, MeshPhongMaterial | Array<MeshPhongMaterial>> {
    keyMeshId: number;
    valueMeshId: number;
    baseLineIndex: number;
    defaultColor: Color;
}

export default ICube;