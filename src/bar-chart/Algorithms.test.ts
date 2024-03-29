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
        expect(barWidth).toBeGreaterThanOrEqual(3);
        expect(barWidth).toBeLessThanOrEqual(5);

        barWidth = getBarWidthByValues([3, 10000, 20000]);
        expect(barWidth).toBeGreaterThanOrEqual(3);
        expect(barWidth).toBeLessThanOrEqual(20000);

        const maxAspectRatio = barWidth / 3;
        expect(maxAspectRatio).toBeGreaterThanOrEqual(10);
    });

    test('getBarWidthByLists', () => {
        const barWidth = getBarWidthByLists([
            [
                {key: '', value: 3},
                {key: '', value: 3},
                {key: '', value: 40000},
            ],
            [
                {key: '', value: 4},
                {key: '', value: 5},
                {key: '', value: 10000},
            ],
        ]);

        expect(barWidth).toBeGreaterThanOrEqual(3);
        expect(barWidth).toBeLessThanOrEqual(40000);
        const maxAspectRatio = barWidth / 3;
        expect(maxAspectRatio).toBeGreaterThanOrEqual(10);
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

    describe('getPositionOfNthBar', () => {
        let bar0Box, bar1Box;
        beforeAll(() => {
            const barWidth = 4;

            const bar0 = new BarMesh(barWidth, 100, new Color());
            bar0.position.set(...getPositionOfNthBar(0, bar0.value, barWidth, 0));
            bar0Box = (new Box3()).setFromObject(bar0);

            const bar1 = new BarMesh(barWidth, 200, new Color());
            bar1.position.set(...getPositionOfNthBar(1, bar1.value, barWidth, 0));
            bar1Box = (new Box3()).setFromObject(bar1);
        });

        test('should left near corner of first bar at origin point', () => {
            expect(bar0Box.min.x).toBeCloseTo(0);
            expect(bar0Box.max.z).toBeCloseTo(0);
        });

        test('should second bar not collide with first bar', () => {
            expect(bar1Box.intersectsBox(bar0Box)).toBe(false);
        });

        test('should second bar be to the right of first bar', () => {
            expect(bar1Box.min.x).toBeGreaterThan(bar0Box.max.x);
        });
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