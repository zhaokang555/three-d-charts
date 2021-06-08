import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshLambertMaterial,
    PlaneGeometry,
    Raycaster
} from 'three';
import { getRealtimeMousePositionRef } from '../CommonUtils';
import ICamera from '../type/ICamera';
import { Intersection } from 'three/src/core/Raycaster';
import { TextInfoPanelMesh } from '../components/TextInfoPanelMesh';

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

        const auxiliaryLines = new AuxiliaryLines(this.width, this.height);
        this.add(auxiliaryLines);

        const textInfoPanelMesh = new TextInfoPanelMesh(this.width / 2, this.width / 15, '00.0, 00.0, 00.0');
        this.add(textInfoPanelMesh);

        return () => {
            raycaster.setFromCamera(mousePosition, camera);
            const intersects = raycaster.intersectObject(this);
            auxiliaryLines.update(intersects);
        };
    };
}

class AuxiliaryLines extends LineSegments<BufferGeometry, LineBasicMaterial> {
    width: number;
    height: number;
    z: number;

    constructor(width, height) {
        super(new BufferGeometry(), new LineBasicMaterial({color: 'red'}));
        this.width = width;
        this.height = height;
        this.z = Math.min(width, height) / 1000; // z-fighting
    }

    update(intersects: Intersection[]) {
        if (intersects.length > 0) {
            const {width, height, z} = this;
            const uv = intersects[0].uv;
            const x = (uv.x - 0.5) * width;
            const y = (uv.y - 0.5) * height;
            this.geometry.setAttribute('position', new Float32BufferAttribute([
                -width / 2, y, z,      width / 2, y, z,
                x, -height / 2, z,     x, height / 2, z,
            ], 3));
        } else {
            this.geometry.deleteAttribute('position');
        }
    }
}