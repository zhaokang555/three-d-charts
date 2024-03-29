import { Object3D, Raycaster, Vector2, Vector3 } from 'three';
import { getRealtimeMousePositionRef } from '../CommonUtils';
import ICamera from '../type/ICamera';

export class RaycasterFromCamera extends Raycaster {
    mousePosition: Vector2;
    camera: ICamera;

    constructor(container: HTMLElement, camera: ICamera) {
        super();
        this.mousePosition = getRealtimeMousePositionRef(container);
        this.camera = camera;
    }

    firstIntersectedObject<T extends Object3D>(objects: Array<T>, cb: (object: T) => void) {
        super.setFromCamera(this.mousePosition, this.camera);
        const intersects = super.intersectObjects(objects);
        if (intersects.length > 0) {
            cb(intersects[0].object as T);
        }
    }

    firstIntersectedPosition<T extends Object3D>(objects: Array<T>, cb: (point: Vector3, uv: Vector2) => void) {
        super.setFromCamera(this.mousePosition, this.camera);
        const intersects = super.intersectObjects(objects);
        if (intersects.length > 0) {
            cb(intersects[0].point, intersects[0].uv);
        }
    }
}