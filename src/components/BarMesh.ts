import { BoxGeometry, Color, DoubleSide, Mesh, MeshLambertMaterial, MeshPhongMaterial } from 'three';
import { createTextCanvasTexture } from '../CommonUtils';

export class BarMesh extends Mesh<BoxGeometry, MeshPhongMaterial | Array<MeshLambertMaterial>> {
    constructor(width: number, height: number, color: Color, key?: string, value?: number) {
        const geometry = new BoxGeometry(width, height, width);

        if (key == null) {
            const material = new MeshPhongMaterial({color, side: DoubleSide});

            super(geometry, material);
            this.name = 'cubeMesh-' + height;
        } else {
            const [map] = createTextCanvasTexture(key, value, color, {padding: 0.05});
            map.rotation = Math.PI / 2;
            const colorMaterial = new MeshPhongMaterial({color, side: DoubleSide});
            const materials = (new Array(6)).fill(colorMaterial);
            materials[2] = new MeshLambertMaterial({map, side: DoubleSide}); // [right, left, top, bottom, front, back]

            super(geometry, materials);
            this.name = 'cubeMesh-' + key;
        }

        this.geometry.computeBoundingBox(); // 计算当前几何体的的边界矩形，更新cube.geometry.boundingBox; 边界矩形不会默认计算，默认为null
        this.defaultColor = color; // store default color in cube mesh object

    }

    keyMeshId: number;
    valueMeshId: number;
    baseLineIndex: number;
    defaultColor: Color;
}
