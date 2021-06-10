import { BoxGeometry, Color, DoubleSide, Mesh, MeshPhongMaterial, Scene } from 'three';
import { defaultBarHighlightColorWhite } from '../Constant';
import { TextMesh } from './TextMesh';

export class BarMesh extends Mesh<BoxGeometry, MeshPhongMaterial> {
    keyMesh: TextMesh;
    valueMesh: TextMesh;
    baseLineIndex: number;
    width: number;
    value: number;
    height: number;
    defaultColor: Color;

    constructor(width: number, value: number, color: Color) {
        const geometry = new BoxGeometry(width, value, width);
        const material = new MeshPhongMaterial({color, side: DoubleSide});

        super(geometry, material);

        this.name = 'barMesh-' + value;
        this.height = value;
        this.geometry.computeBoundingBox(); // 计算当前几何体的的边界矩形，更新bar.geometry.boundingBox; 边界矩形不会默认计算，默认为null
        this.defaultColor = color; // store default color in bar mesh object
        this.width = width;
        this.value = value;
    }

    highlight() {
        this.material.color.set(defaultBarHighlightColorWhite);
        if (this.keyMesh) {
            this.keyMesh.scale.set(2, 2, 2);
        }
        if (this.valueMesh) {
            this.valueMesh.scale.set(2, 2, 2);
        }
    };

    unhighlight() {
        this.material.color.set(this.defaultColor);
        if (this.keyMesh) {
            this.keyMesh.scale.set(1, 1, 1);
        }
        if (this.valueMesh) {
            this.valueMesh.scale.set(1, 1, 1);
        }
    }
}
