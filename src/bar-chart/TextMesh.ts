import { Font, Mesh, MeshPhongMaterial, TextGeometry } from 'three';
import { defaultTextColorBlue } from '../Constant';

export class TextMesh extends Mesh<TextGeometry, MeshPhongMaterial> {
    constructor(text: string, font: Font, size: number) {
        const fontDepth = size / 8;

        const geometry = new TextGeometry(text, {
            font,
            size,
            height: fontDepth,
        });
        geometry.center(); // has called geometry.computeBoundingBox() in center()
        geometry.translate(0, geometry.boundingBox.max.y, 0); // 向上移动半个自身高度，防止字体埋在bar里/plane里
        // after translate, geometry.boundingBox.min.y = 0 and geometry.boundingBox.max.y = height
        // NOTE: do not call center() again after translate, it will make geometry.boundingBox.min.y = -height/2 and geometry.boundingBox.max.y = height/2

        const material = new MeshPhongMaterial({
            color: defaultTextColorBlue,
            emissive: defaultTextColorBlue, // 自发光
            emissiveIntensity: 0.8,
        });

        super(geometry, material);
    }
}