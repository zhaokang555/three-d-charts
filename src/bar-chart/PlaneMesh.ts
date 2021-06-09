import { BarMesh } from './BarMesh';
import { DoubleSide, Mesh, MeshLambertMaterial, PlaneGeometry, Vector3 } from 'three';
import { defaultPlaneColorGray } from '../Constant';

export class PlaneMesh extends Mesh<PlaneGeometry, MeshLambertMaterial> {
    width: number;

    constructor(bars: Array<BarMesh>) {
        const barPositions = bars.map(bar => bar.position);

        // 根据最右/后边bar的x坐标 来确定width
        const maxX = Math.max(...barPositions.map(p => Math.abs(p.x)));
        const maxZ = Math.max(...barPositions.map(p => Math.abs(p.z)));
        const width =  Math.max(maxX, maxZ) * 2 + bars[0].width;

        super(
            new PlaneGeometry(width, width),
            new MeshLambertMaterial({
                color: defaultPlaneColorGray,
                side: DoubleSide,
            })
        );
        // 因为plane默认在xy平面上, 需要把它旋转到xz平面上
        this.rotateOnWorldAxis(new Vector3(1, 0, 0), -Math.PI / 2); // 将plane绕x轴顺时针旋转90度
        this.position.y = -width / 10000; // z-fighting
        this.name = 'planeMesh'; // for find plane mesh in scene;
        this.width = width;
    }
}