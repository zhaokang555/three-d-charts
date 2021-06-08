import helvetiker_regular from "../helvetiker_regular.typeface.json";
import { colormap } from "../CommonAlgorithms";
import {
    AmbientLight,
    DoubleSide,
    FontLoader,
    Mesh,
    MeshLambertMaterial,
    PlaneGeometry,
    PointLight,
    Scene,
    Vector3
} from 'three';
import { defaultLightColorWhite, defaultPlaneColorGray } from '../Constant';
import {
    getBarWidthByValues,
    getPositionOfKeyOnTopByBar,
    getPositionOfNthBar,
    getPositionOfValueByBar
} from './Algorithms';
import KeyValueInfoPanelMesh from '../components/KeyValueInfoPanelMesh';
import { BarMesh, getBars } from './BarMesh';
import { TextMesh } from './TextMesh';

export const addLightToScene = (scene: Scene, planeWidth: number) => {
    const light = new PointLight();
    light.position.set(0, planeWidth, 0);
    scene.add(light);

    scene.add(new AmbientLight(defaultLightColorWhite, 0.5)); // 环境光
};

export const addPlaneToScene = (scene: Scene): number => {
    let planeWidth = 100;
    const bars = getBars(scene);
    const barPositions = bars.map(bar => bar.position);
    if (barPositions.length === 0) return;

    // 根据最右边bar的x坐标 和 最高bar的高度 来确定planeWidth
    const maxX = Math.max(...barPositions.map(p => Math.abs(p.x)));
    const maxZ = Math.max(...barPositions.map(p => Math.abs(p.z)));
    const maxXZ = Math.max(maxX, maxZ);
    const maxY = Math.max(...barPositions.map(p => Math.abs(p.y * 2)));
    const planeWidthByMaxXZ = maxXZ * 2 + bars[0].width;
    if (planeWidthByMaxXZ > maxY) {
        planeWidth = maxXZ * 2 + bars[0].width;
    } else {
        planeWidth = maxY;
    }
    const planeMesh = new Mesh(
        new PlaneGeometry(planeWidth, planeWidth),
        new MeshLambertMaterial({
            color: defaultPlaneColorGray,
            side: DoubleSide,
        })
    );
    // 因为plane默认在xy平面上, 需要把它旋转到xz平面上
    planeMesh.rotateOnWorldAxis(new Vector3(1, 0, 0), -Math.PI / 2); // 在世界空间中将plane绕x轴顺时针旋转90度
    planeMesh.position.y = -planeWidth / 10000; // z-fighting
    planeMesh.name = 'planeMesh'; // for find plane mesh in scene;
    scene.add(planeMesh);

    return planeWidth;
};

export const addBarsToScene = (scene: Scene, values: Array<number>, baseLineIndex: number = 0, barWidth: number = null,
                                maxValue: number = null, minValue: number = null): Array<BarMesh> => {
    // set default value
    barWidth = barWidth || getBarWidthByValues(values);
    maxValue = maxValue || Math.max(...values);
    minValue = minValue || Math.min(...values);

    const colors = colormap(100);
    const bars = [];
    for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        const colorIndex = Math.round((value - minValue) / (maxValue - minValue) * 99); // colorIndex = 0, 1, 2, ..., 99
        const color = colors[colorIndex];

        const bar = new BarMesh(barWidth, value, color);
        bar.baseLineIndex = baseLineIndex; // store baseLineIndex in bar mesh object
        bar.position.set(...getPositionOfNthBar(i, value, barWidth, baseLineIndex));
        scene.add(bar);
        bars.push(bar);
    }

    return bars;
};

export const addKeysOnTopToScene = (scene: Scene, keys: Array<string>, keyMaxLength: number, bars: Array<BarMesh>) => {
    const loader = new FontLoader();
    // ttf to json, see: https://gero3.github.io/facetype.js/
    // load font async, because Alibaba_PuHuiTi_Regular.json is too large
    loader.load('/Alibaba_PuHuiTi_Regular.json', font => {
        const charWidth = bars[0].width / keyMaxLength;

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const bar = bars[i];

            const textMesh = new TextMesh(key, font, charWidth);

            const valueMesh = scene.getObjectById(bar.valueMeshId) as TextMesh;
            const valueMeshHeight = valueMesh.geometry.boundingBox.max.y - valueMesh.geometry.boundingBox.min.y;

            textMesh.position.set(...getPositionOfKeyOnTopByBar(bar, valueMeshHeight * 2));
            scene.add(textMesh);
            bar.keyMeshId = textMesh.id;
        }
    });
};

export const addValuesToScene = (scene: Scene, values: Array<number>, valueMaxLength: number = 0, bars: Array<BarMesh>) => {
    const loader = new FontLoader();
    const font = loader.parse(helvetiker_regular);
    const charWidth = bars[0].width / valueMaxLength;

    for (let i = 0; i < values.length; ++i) {
        const valueText = values[i].toString();
        const bar = bars[i];

        const textMesh = new TextMesh(valueText, font, charWidth);
        textMesh.position.set(...getPositionOfValueByBar(bar));
        scene.add(textMesh);

        bar.valueMeshId = textMesh.id;
    }
};

export const addInfoPanelToScene = (scene: Scene, key: string, value: number, bar: BarMesh) => {
    const {x, z} = bar.position;
    const infoPanelSize = bar.width * 0.7;
    const infoPanelMesh = new KeyValueInfoPanelMesh(infoPanelSize, key, value);
    infoPanelMesh.position.set(x, value + infoPanelSize / 2, z);
    scene.add(infoPanelMesh);
    return infoPanelMesh;
};
