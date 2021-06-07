import { DoubleSide, Mesh, MeshLambertMaterial, PlaneGeometry, Raycaster } from 'three';
import { getRealtimeMousePositionRef } from '../CommonUtils';
import ICamera from '../type/ICamera';

export class ScatterPlaneHelper extends Mesh<PlaneGeometry, MeshLambertMaterial> {
    update: () => void = null;

    constructor(width: number, height: number, container, camera) {
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

        return () => {
            raycaster.setFromCamera(mousePosition, camera);
            const intersects = raycaster.intersectObject(this);
            if (intersects.length > 0) {
                console.log(intersects);
            }
        };
    };
}