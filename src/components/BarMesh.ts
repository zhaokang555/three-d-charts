import { BoxGeometry, Color, DoubleSide, Mesh, MeshLambertMaterial, MeshPhongMaterial } from 'three';
import { createKeyValueCanvasTexture } from '../CommonUtils';

export class BarMesh extends Mesh<BoxGeometry, MeshPhongMaterial | Array<MeshLambertMaterial>> {
    constructor(width: number, value: number, color: Color, key?: string, height?: number) {
        if (key == null) {
            const geometry = new BoxGeometry(width, value, width);
            const material = new MeshPhongMaterial({color, side: DoubleSide});

            super(geometry, material);
            this.name = 'barMesh-' + value;
            this.height = value;
        } else {
            const geometry = new BoxGeometry(width, height, width);

            const [map] = createKeyValueCanvasTexture(key, value, color, {padding: 0.05});
            map.rotation = Math.PI / 2;
            const colorMaterial = new MeshPhongMaterial({color, side: DoubleSide});
            const materials = (new Array(6)).fill(colorMaterial);
            materials[2] = new MeshLambertMaterial({map, side: DoubleSide}); // [right, left, top, bottom, front, back]

            super(geometry, materials);
            this.name = 'barMesh-' + key;
            this.height = height;
        }

        this.geometry.computeBoundingBox(); // 计算当前几何体的的边界矩形，更新bar.geometry.boundingBox; 边界矩形不会默认计算，默认为null
        this.defaultColor = color; // store default color in bar mesh object
        this.width = width;
        this.value = value;
    }

    keyMeshId: number;
    valueMeshId: number;
    baseLineIndex: number;
    width: number;
    value: number;
    height: number;
    defaultColor: Color;
}
