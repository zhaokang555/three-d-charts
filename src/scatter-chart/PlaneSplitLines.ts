import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments } from 'three';

export class PlaneSplitLines extends LineSegments {

    constructor(x, y, z) {

        const vertices = [
            0, 0, 0, x, 0, 0,
            0, 0, 0, 0, y, 0,
            0, 0, 0, 0, 0, z
        ];

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

        const material = new LineBasicMaterial({color: '#ffffff'});

        super(geometry, material);
    }

}
