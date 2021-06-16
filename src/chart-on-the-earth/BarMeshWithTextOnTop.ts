import { BoxGeometry, Color, DoubleSide, Mesh, MeshLambertMaterial, MeshPhongMaterial } from 'three';
import { createKeyValueCanvasTexture } from '../CommonUtils';
import ICoordinates from '../type/ICoordinates';
import { getPositionByLonLat } from './Algorithms';
import { barAltitude, earthRadius } from '../Constant';

export class BarMeshWithTextOnTop extends Mesh<BoxGeometry, Array<MeshLambertMaterial>> {
    constructor(value: number, color: Color, key: string, height: number, center: ICoordinates) {
        const barWidth = earthRadius * 0.025; // set bottom side length
        const geometry = new BoxGeometry(barWidth, height, barWidth);

        const [map] = createKeyValueCanvasTexture(key, value, color, {padding: 0.05});
        map.rotation = Math.PI / 2;
        const colorMaterial = new MeshPhongMaterial({color, side: DoubleSide});
        const materials = (new Array(6)).fill(colorMaterial);
        materials[2] = new MeshLambertMaterial({map, side: DoubleSide}); // [right, left, top, bottom, front, back]

        super(geometry, materials);

        this.name = 'barMesh-' + key;
        this.height = height;
        this.geometry.computeBoundingBox(); // 计算当前几何体的的边界矩形，更新bar.geometry.boundingBox; 边界矩形不会默认计算，默认为null
        this.defaultColor = color; // store default color in bar mesh object
        this.width = barWidth;
        this.value = value;

        const centerPosition = getPositionByLonLat(...center, earthRadius + barAltitude);
        this.position.copy(centerPosition);

        // const up = this.up.clone().normalize();
        // this.quaternion.setFromUnitVectors(up, centerPosition.clone().normalize());
        // OR
        const rotateAxis = this.up.clone().cross(centerPosition).normalize();
        const angle = this.up.clone().angleTo(centerPosition);
        this.rotateOnAxis(rotateAxis, angle);

        this.translateY(height / 2);
    }

    width: number;
    value: number;
    height: number;
    defaultColor: Color;
}