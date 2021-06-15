import { EarthMeshForProvince } from './EarthMeshForProvince';
import { BarMeshWithTextOnTop } from '../chart-on-the-earch/BarMeshWithTextOnTop';
import { Line } from 'three';
import * as china_geo_json from '../chart-on-the-earch/china.geo.json';

describe('EarthMeshForProvince.addProvinces, when add 2 provinces', () => {
    let earth;

    beforeAll(() => {
        earth = new EarthMeshForProvince();
        earth.addProvinces([
            {key: '北京市', value: 1},
            {key: '上海市', value: 2},
        ]);
    });

    test('should earth has 2 bars', () => {
        const bars = earth.children.filter(c => c instanceof BarMeshWithTextOnTop);
        expect(bars.length).toBe(2);
    });

    test('should Lines count on earth equal rings count in china.geo.json', () => {
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