import { EarthMeshForProvince } from './EarthMeshForProvince';
import { BarMeshWithTextOnTop } from '../chart-on-the-earth/BarMeshWithTextOnTop';

describe('EarthMeshForProvince.addProvinces, when add 3 provinces', () => {
    let earth, bars;

    beforeAll(() => {
        earth = new EarthMeshForProvince();
        earth.addProvinces([
            {key: '北京市', value: 7},
            {key: '上海市', value: 8},
            {key: '湖北省', value: 8},
        ]);
        bars = earth.children.filter(c => c instanceof BarMeshWithTextOnTop);
    });

    test('should earth has 3 bars', () => {
        expect(bars.length).toBe(3);
    });

    test('should each bar has correct value', () => {
        expect(bars[0].value).toBeCloseTo(7);
        expect(bars[1].value).toBeCloseTo(8);
        expect(bars[2].value).toBeCloseTo(8);
    });

    test('should each bar has correct height', () => {
        expect(bars[0].height).toBeLessThan(bars[1].height);
        expect(bars[1].height).toBeCloseTo(bars[2].height);
    });
});