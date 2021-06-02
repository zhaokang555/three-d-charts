import { BoxGeometry, Color, Mesh, MeshLambertMaterial, MeshPhongMaterial } from 'three';

interface ICube extends Mesh<BoxGeometry, MeshPhongMaterial | Array<MeshLambertMaterial>> {
    keyMeshId: number;
    valueMeshId: number;
    baseLineIndex: number;
    defaultColor: Color;
}

export default ICube;