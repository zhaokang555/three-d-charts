import { getPositionByLonLat } from './Algorithms';

describe('Algorithms', () => {
    test('getPositionByLonLat', () => {
        let position = getPositionByLonLat(0, 0, 1);
        expect(position.x).toBeCloseTo(0);
        expect(position.y).toBeCloseTo(0);
        expect(position.z).toBeCloseTo(1);

        position = getPositionByLonLat(-180, 0, 1);
        expect(position.x).toBeCloseTo(0);
        expect(position.y).toBeCloseTo(0);
        expect(position.z).toBeCloseTo(-1);

        position = getPositionByLonLat(180, 0, 1);
        expect(position.x).toBeCloseTo(0);
        expect(position.y).toBeCloseTo(0);
        expect(position.z).toBeCloseTo(-1);

        position = getPositionByLonLat(-90, 0, 1);
        expect(position.x).toBeCloseTo(-1);
        expect(position.y).toBeCloseTo(0);
        expect(position.z).toBeCloseTo(0);

        position = getPositionByLonLat(90, 0, 1);
        expect(position.x).toBeCloseTo(1);
        expect(position.y).toBeCloseTo(0);
        expect(position.z).toBeCloseTo(0);

        position = getPositionByLonLat(0, 90, 1);
        expect(position.x).toBeCloseTo(0);
        expect(position.y).toBeCloseTo(1);
        expect(position.z).toBeCloseTo(0);

        position = getPositionByLonLat(0, -90, 1);
        expect(position.x).toBeCloseTo(0);
        expect(position.y).toBeCloseTo(-1);
        expect(position.z).toBeCloseTo(0);
    });
});