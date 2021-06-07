import {
    BufferGeometry,
    DoubleSide, Float32BufferAttribute,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshLambertMaterial,
    PlaneGeometry,
    Raycaster
} from 'three';
import { getRealtimeMousePositionRef } from '../CommonUtils';
import ICamera from '../type/ICamera';

export class ScatterPlaneHelper extends Mesh<PlaneGeometry, MeshLambertMaterial> {
    update: () => void = null;

    constructor(public width: number, public height: number, container, camera) {
        super(
            new PlaneGeometry(width, height),
            new MeshLambertMaterial({
                side: DoubleSide,
                transparent: true,
                opacity: 0.6,
            })
        );
        this.update = this.initRealtimeAuxiliaryLines(container, camera);
    }

    initRealtimeAuxiliaryLines(container: HTMLElement, camera: ICamera) {
        const raycaster = new Raycaster();
        const mousePosition = getRealtimeMousePositionRef(container);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute([], 3));
        const auxiliaryLines = new LineSegments(geometry, new LineBasicMaterial({color: 'red'}));
        this.add(auxiliaryLines);

        return () => {
            raycaster.setFromCamera(mousePosition, camera);
            const intersects = raycaster.intersectObject(this);
            if (intersects.length > 0) {
                const uv = intersects[0].uv;
                const x = (uv.x - 0.5) * this.width;
                const y = (uv.y - 0.5) * this.height;
                geometry.setAttribute('position', new Float32BufferAttribute([
                    -this.width / 2, y, 0,      this.width / 2, y, 0,
                    x, -this.height / 2, 0,     x, this.height / 2, 0,
                ], 3));
            } else {
                geometry.setAttribute('position', new Float32BufferAttribute([], 3));
            }
        };
    };
}