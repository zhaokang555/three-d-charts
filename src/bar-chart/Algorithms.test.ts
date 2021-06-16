import { getBarWidthByLists, getBarWidthByValues, getMaxAndMinValueByLists } from './Algorithms';

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
                {key: '', value: -9.4},
            ],
            [
                {key: '', value: 5},
                {key: '', value: 0.3},
            ],
        ]);

        expect(max).toBeCloseTo(8);
        expect(min).toBeCloseTo(-9.4);
    });
});