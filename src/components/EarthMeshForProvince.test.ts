import { EarthMeshForProvince } from './EarthMeshForProvince';
import { BarMeshWithTextOnTop } from '../chart-on-the-earth/BarMeshWithTextOnTop';
import { Line } from 'three';
import * as china_geo_json from '../chart-on-the-earth/china.geo.json';

describe('EarthMeshForProvince.addProvinces, when add 2 provinces', () => {
    let earth;
    let bars;

    beforeAll(() => {
        earth = new EarthMeshForProvince();
        earth.addProvinces([
            {key: '北京市', value: 1},
            {key: '上海市', value: 2},
        ]);
        bars = earth.children.filter(c => c instanceof BarMeshWithTextOnTop);
    });

    test('should earth has 2 bars', () => {
        expect(bars.length).toBe(2);
    });

    test('each bar has correct value', () => {
        expect(bars[0].value).toBeCloseTo(1);
        expect(bars[1].value).toBeCloseTo(2);
    });

    test('should lines count on earth equal rings count in china.geo.json', () => {
        const provinces = china_geo_json.features.filter(f => f.properties.name === '北京市'
            || f.properties.name === '上海市');

        const rings = [];
        provinces.forEach(prov => {
            prov.geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => rings.push(ring));
            })
        });

        const lines = earth.children.filter(c => c instanceof Line);
        expect(lines.length).toBe(rings.length);
    })
});