import {
    getBarWidthByLists,
    getBarWidthByValues,
    getMaxAndMinValueByLists,
    getPositionOfKeyOnTopByBar,
    getPositionOfNthBar, getPositionOfValueByBar
} from './Algorithms';
import { BarMesh } from './BarMesh';
import { Color } from 'three';
import { TextMesh } from './TextMesh';

describe('Algorithms', () => {
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

    test('getPositionOfKeyOnTopByBar', () => {
        const mockBar = {
            height: 300,
            position: {x: 100, z: 200}
        } as BarMesh;
        const mockValueMesh = {height: 20} as TextMesh;
        const mockKeyMesh = {height: 30} as TextMesh;

        const position = getPositionOfKeyOnTopByBar(mockBar, mockValueMesh, mockKeyMesh);

        expect(position[0]).toBeCloseTo(100);
        expect(position[1]).toBeCloseTo(370);
        expect(position[2]).toBeCloseTo(200);
    });

    test('getPositionOfValueByBar', () => {
        const mockBar = {
            height: 300,
            position: {x: 100, z: 200}
        } as BarMesh;
        const mockValueMesh = {height: 20} as TextMesh;

        const position = getPositionOfValueByBar(mockBar, mockValueMesh);

        expect(position[0]).toBeCloseTo(100);
        expect(position[1]).toBeCloseTo(320);
        expect(position[2]).toBeCloseTo(200);
    });
});