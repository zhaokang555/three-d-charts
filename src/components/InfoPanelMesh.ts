import { Color, DoubleSide, Mesh, MeshLambertMaterial, PlaneGeometry } from 'three';
import { createTextCanvasTexture } from '../CommonUtils';

export default class InfoPanelMesh extends Mesh<PlaneGeometry, MeshLambertMaterial> {
    constructor(size: number, key: string, value: number) {
        const [map, alphaMap] = createTextCanvasTexture(key, value, new Color('black'));
        const material = new MeshLambertMaterial({
            map,
            alphaMap,
            side: DoubleSide,
            transparent: true,
        });
        const geometry = new PlaneGeometry(size, size);
        super(geometry, material);
    }
}