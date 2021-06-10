import { Font, Mesh, MeshPhongMaterial, Scene, TextGeometry } from 'three';
import { defaultTextColorBlue } from '../Constant';
import ICamera from '../type/ICamera';

export class TextMesh extends Mesh<TextGeometry, MeshPhongMaterial> {
    height: number;

    constructor(text: string, font: Font, size: number) {
        const fontDepth = size / 8;

        const geometry = new TextGeometry(text, {
            font,
            size,
            height: fontDepth,
        });
        geometry.center(); // has called geometry.computeBoundingBox() in center()

        const material = new MeshPhongMaterial({
            color: defaultTextColorBlue,
            emissive: defaultTextColorBlue, // 自发光
            emissiveIntensity: 0.8,
        });

        super(geometry, material);
        this.height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    }

    lookAtCamera(camera: ICamera) {
        const lookAtPosition = camera.position.clone().setY(this.position.y);
        this.lookAt(lookAtPosition);
    }
}
