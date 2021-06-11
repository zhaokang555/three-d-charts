import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshLambertMaterial,
    PlaneGeometry,
    Vector2,
    Vector3
} from 'three';
import ICamera from '../type/ICamera';
import { TextInfoPanelMesh } from '../components/TextInfoPanelMesh';
import { RaycasterFromCamera } from '../components/RaycasterFromCamera';

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
        const ray = new RaycasterFromCamera(container, camera);

        const auxiliaryLines = new AuxiliaryLines(this.width, this.height);
        this.add(auxiliaryLines);

        const positionInfoPanelMesh = new PositionInfoPanelMesh(this.width, this.height);
        this.add(positionInfoPanelMesh);

        return () => {
            auxiliaryLines.hide();
            positionInfoPanelMesh.hide();
            ray.firstIntersectedPosition([this], (point, uv) => {
                auxiliaryLines.showAt(uv);
                positionInfoPanelMesh.showAt(uv, point);
            });
        };
    };
}

class AuxiliaryLines extends LineSegments<BufferGeometry, LineBasicMaterial> {
    width: number;
    height: number;
    z: number;

    constructor(width, height) {
        super(new BufferGeometry(), new LineBasicMaterial());
        this.width = width;
        this.height = height;
        this.z = Math.min(width, height) / 1000; // z-fighting
    }

    hide() {
        this.visible = false;
    }

    showAt(uv: Vector2) {
        this.visible = true;
        const {width, height, z} = this;
        const x = (uv.x - 0.5) * width;
        const y = (uv.y - 0.5) * height;
        this.geometry.setAttribute('position', new Float32BufferAttribute([
            -width / 2, y, z,      width / 2, y, z,
            x, -height / 2, z,     x, height / 2, z,
        ], 3));
    }
}

class PositionInfoPanelMesh extends TextInfoPanelMesh {
    /**
     * @param parentW ScatterPlaneHelperWidth
     * @param parentH ScatterPlaneHelperHeight
     */
    constructor(public parentW: number, public parentH: number) {
        super(parentW / 2, parentW / 15, '00.0, 00.0, 00.0');
        this.visible = false;
        this.position.z = parentW / 1000; // z-fighting
    }

    hide() {
        this.visible = false;
    }

    showAt(uv: Vector2, point: Vector3) {
        this.visible = true;

        super.update(point.toArray().map(n => n.toString()).map(s => s.substr(0, 4)).join(', '));
        this._setPositionByUv(uv);
    }

    private _setPositionByUv(uv: Vector2) {
        const x = uv.x - 0.5;
        const y = uv.y - 0.5;

        const offsetX = x > 0 ? -this.width / 2 : this.width / 2;
        const offsetY = y > 0 ? -this.height / 2 : this.height / 2;

        this.position.setX(x * this.parentW + offsetX);
        this.position.setY(y * this.parentH + offsetY);
    }
}