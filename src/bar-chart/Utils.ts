import helvetiker_regular from "../helvetiker_regular.typeface.json";
import { colormap } from "../CommonAlgorithms";
import { AmbientLight, FontLoader, PointLight, Scene } from 'three';
import { defaultLightColorWhite } from '../Constant';
import {
    getBarWidthByValues,
    getPositionOfKeyOnTopByBar,
    getPositionOfNthBar,
    getPositionOfValueByBar
} from './Algorithms';
import KeyValueInfoPanelMesh from '../components/KeyValueInfoPanelMesh';
import { BarMesh } from './BarMesh';
import { TextMesh } from './TextMesh';

export const addLightToScene = (scene: Scene, planeWidth: number) => {
    const light = new PointLight();
    light.position.set(0, planeWidth, 0);
    scene.add(light);

    scene.add(new AmbientLight(defaultLightColorWhite, 0.5)); // 环境光
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
    const textMeshes: Array<TextMesh> = [];
    // ttf to json, see: https://gero3.github.io/facetype.js/
    // load font async, because Alibaba_PuHuiTi_Regular.json is too large
    loader.load('/Alibaba_PuHuiTi_Regular.json', font => {
        const charWidth = bars[0].width / keyMaxLength;

        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const bar = bars[i];

            const textMesh = new TextMesh(key, font, charWidth);

            textMesh.position.set(...getPositionOfKeyOnTopByBar(bar, bar.valueMesh, textMesh));
            scene.add(textMesh);
            textMeshes.push(textMesh);

            bar.keyMesh = textMesh;
        }
    });
    return textMeshes;
};

export const addValuesToScene = (scene: Scene, values: Array<number>, valueMaxLength: number = 0, bars: Array<BarMesh>) => {
    const loader = new FontLoader();
    const font = loader.parse(helvetiker_regular);
    const charWidth = bars[0].width / valueMaxLength;
    const textMeshes: Array<TextMesh> = [];

    for (let i = 0; i < values.length; ++i) {
        const valueText = values[i].toString();
        const bar = bars[i];

        const textMesh = new TextMesh(valueText, font, charWidth);
        textMesh.position.set(...getPositionOfValueByBar(bar, textMesh));
        scene.add(textMesh);
        textMeshes.push(textMesh);

        bar.valueMesh = textMesh;
    }
    return textMeshes;
};

export const addInfoPanelToScene = (scene: Scene, key: string, value: number, bar: BarMesh) => {
    const {x, z} = bar.position;
    const infoPanelSize = bar.width * 0.7;
    const infoPanelMesh = new KeyValueInfoPanelMesh(infoPanelSize, key, value);
    infoPanelMesh.position.set(x, value + infoPanelSize / 2, z);
    scene.add(infoPanelMesh);
    return infoPanelMesh;
};
