import {
    getBarWidthByLists,
    getBarWidthByValues,
    getMaxAndMinValueByLists,
    getPositionOfKeyOnTopByBar,
    getPositionOfNthBar,
    getPositionOfValueByBar
} from './Algorithms';
import { BarMesh } from './BarMesh';
import { TextMesh } from './TextMesh';
import { Box3, Color, FontLoader } from 'three';
import helvetiker_regular from '../helvetiker_regular.typeface.json';

describe('Algorithms', () => {
    let bar, valueMesh, keyMesh;

    beforeAll(() => {
        const loader = new FontLoader();
        const font = loader.parse(helvetiker_regular);

        bar = new BarMesh(4, 300, new Color());
        bar.position.set(100, bar.value / 2, 200);

        valueMesh = new TextMesh('text', font, 12);
        valueMesh.position.set(...getPositionOfValueByBar(bar, valueMesh));

        keyMesh = new TextMesh('text', font, 12);
        keyMesh.position.set(...getPositionOfKeyOnTopByBar(bar, valueMesh, keyMesh));
    });

    test('getBarWidthByValues', () => {
        let barWidth = getBarWidthByValues([3, 4, 5]);
        expect(barWidth).toBeCloseTo(4);

        barWidth = getBarWidthByValues([1, 10000, 20000]);
        expect(barWidth).toBeCloseTo(10);
    });

    test('getBarWidthByLists', () => {
        const barWidth = getBarWidthByLists([
            [
                {key: '', value: 2},
                {key: '', value: 3},
                {key: '', value: 4},
            ],
            [
                {key: '', value: 4},
                {key: '', value: 5},
                {key: '', value: 6},
            ],
        ]);

        expect(barWidth).toBeCloseTo(4);
    });

    test('getMaxAndMinValueByLists', () => {
        const [max, min] = getMaxAndMinValueByLists([
            [
                {key: '', value: 8},
                {key: '', value: 1},
            ],
            [
                {key: '', value: 5},
                {key: '', value: -9.4},
            ],
        ]);

        expect(max).toBeCloseTo(8);
        expect(min).toBeCloseTo(-9.4);
    });

    test('getPositionOfNthBar', () => {
        const position = getPositionOfNthBar(0, 100, 4, 0);

        expect(position[0]).toBeCloseTo(2);
        expect(position[1]).toBeCloseTo(50);
        expect(position[2]).toBeCloseTo(-2);
    });

    describe('getPositionOfValueByBar', () => {
        test('should value mesh has same position with bar on plane xoz', () => {
            expect(valueMesh.position.x).toBeCloseTo(bar.position.x);
            expect(valueMesh.position.z).toBeCloseTo(bar.position.z);
        });

        test('should value mesh not collide with bar', () => {
            const valueMeshBox = (new Box3()).setFromObject(valueMesh);
            const barBox = (new Box3()).setFromObject(bar);

            expect(valueMeshBox.intersectsBox(barBox)).toBe(false);
        });
    });

    describe('getPositionOfKeyOnTopByBar', () => {
        test('should key mesh has same position with bar on plane xoz', () => {
            expect(keyMesh.position.x).toBeCloseTo(bar.position.x);
            expect(keyMesh.position.z).toBeCloseTo(bar.position.z);
        });

        test('should key mesh not collide with bar and value mesh', () => {
            const keyMeshBox = (new Box3()).setFromObject(keyMesh);
            const valueMeshBox = (new Box3()).setFromObject(valueMesh);
            const barBox = (new Box3()).setFromObject(bar);

            expect(keyMeshBox.intersectsBox(barBox)).toBe(false);
            expect(keyMeshBox.intersectsBox(valueMeshBox)).toBe(false);
        });
    });
});