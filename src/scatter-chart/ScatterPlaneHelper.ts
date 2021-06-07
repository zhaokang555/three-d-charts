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
        const auxiliaryLines = new LineSegments(geometry, new LineBasicMaterial({color: 'red'}));
        this.add(auxiliaryLines);
        const z = Math.min(this.width, this.height) / 1000; // z-fighting

        return () => {
            raycaster.setFromCamera(mousePosition, camera);
            const intersects = raycaster.intersectObject(this);
            if (intersects.length > 0) {
                const uv = intersects[0].uv;
                const x = (uv.x - 0.5) * this.width;
                const y = (uv.y - 0.5) * this.height;
                geometry.setAttribute('position', new Float32BufferAttribute([
                    -this.width / 2, y, z,      this.width / 2, y, z,
                    x, -this.height / 2, z,     x, this.height / 2, z,
                ], 3));
            } else {
                geometry.deleteAttribute('position');
            }
        };
    };
}