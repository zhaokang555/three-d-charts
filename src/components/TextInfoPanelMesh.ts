import { CanvasTexture, Color, DoubleSide, Mesh, MeshLambertMaterial, PlaneGeometry } from 'three';
import { getTextColorByBackgroundColor } from '../CommonAlgorithms';

export class TextInfoPanelMesh extends Mesh<PlaneGeometry, MeshLambertMaterial>  {
    constructor(width: number, height: number, text: string) {
        const [map, alphaMap] = createTexture(text, width / height);
        const material = new MeshLambertMaterial({
            map,
            alphaMap,
            side: DoubleSide,
            transparent: true,
        });
        const geometry = new PlaneGeometry(width, height);
        super(geometry, material);
        this.position.z = width / 1000; // z-fighting
        this.name = `InfoPanelMesh${text}`
    }

    update() {

    }
}

const createTexture = (text: string, aspectRatio: number): [CanvasTexture, CanvasTexture] => {
    const SIZE = 400;
    const PADDING = SIZE * 0.1;
    const CONTENT_SIZE = SIZE - PADDING * 2;
    const BG_COLOR = new Color('#000000');
    const DEFAULT_FONT_SIZE = 10;
    const W = SIZE;
    const H = SIZE / aspectRatio;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // test font size
    ctx.font = `${DEFAULT_FONT_SIZE}px sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const scale = CONTENT_SIZE / textWidth;
    const font = `${DEFAULT_FONT_SIZE * scale}px sans-serif`;

    ctx.fillStyle = '#' + BG_COLOR.getHexString();
    ctx.fillRect(0, 0, W, H);
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = getTextColorByBackgroundColor(BG_COLOR);
    ctx.fillText(text, W / 2, H / 2, W);
    const map = new CanvasTexture(canvas);
    map.center.set(0.5, 0.5);

    const roundedCornerRect = new Path2D();
    const r = H * 0.2;
    roundedCornerRect.moveTo( 0, r);
    roundedCornerRect.lineTo(0, H - r);
    roundedCornerRect.arcTo(0, H, r, H, r);
    roundedCornerRect.lineTo(W - r, H);
    roundedCornerRect.arcTo(W, H, W, H - r, r);
    roundedCornerRect.lineTo(W, r);
    roundedCornerRect.arcTo(W, 0, W - r, 0, r);
    roundedCornerRect.lineTo(r, 0);
    roundedCornerRect.arcTo(0, 0, 0, r, r);

    const canvasAlphaMap = document.createElement('canvas');
    canvasAlphaMap.width = W;
    canvasAlphaMap.height = H;
    const ctxAlphaMap = canvasAlphaMap.getContext('2d');
    ctxAlphaMap.fillStyle = '#000000';
    ctxAlphaMap.fillRect(0, 0, W, H);
    ctxAlphaMap.fillStyle = 'rgb(0, 190, 0)';
    ctxAlphaMap.fill(roundedCornerRect);
    ctxAlphaMap.font = font;
    ctxAlphaMap.textAlign = 'center';
    ctxAlphaMap.textBaseline = 'middle';
    ctxAlphaMap.fillStyle = '#00ff00';
    ctxAlphaMap.fillText(text, W / 2, H / 2, W);

    const alphaMap = new CanvasTexture(canvasAlphaMap);
    alphaMap.center.set(0.5, 0.5);

    return [map, alphaMap];
};