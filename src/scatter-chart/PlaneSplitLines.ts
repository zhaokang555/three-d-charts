import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments } from 'three';

export class PlaneSplitLines extends LineSegments {

    constructor(x, y, z) {

        const vertices = [
            0, 0, 0, x, 0, 0,
            0, 0, 0, 0, y, 0,
            0, 0, 0, 0, 0, z
        ];

        const colors = [
            1, 0, 0, 1, 0, 0,
            0, 1, 0, 0, 1, 0,
            0, 0, 1, 0, 0, 1
        ];

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

        const material = new LineBasicMaterial({vertexColors: true});

        super(geometry, material);
    }

}
