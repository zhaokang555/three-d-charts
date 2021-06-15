import { EarthMeshForRoute } from './EarthMeshForRoute';
import { Mesh, PerspectiveCamera, PlaneGeometry, TubeGeometry } from 'three';

describe('EarthMeshForRoute.addRoutes, when add 2 routes', () => {
    let earth;
    let routes;
    let infoPanels;

    beforeAll(() => {
        earth = new EarthMeshForRoute();
        earth.addRoutes([
            {from: '北京', to: '上海', weight: 1},
            {from: 'customCityName', to: '上海', weight: 2}
        ], [
            {name: "customCityName", coordinates: [100.0, 20.0]},
        ], new PerspectiveCamera());

        routes = earth.children.filter(c => c instanceof Mesh && c.geometry instanceof TubeGeometry);
        infoPanels = earth.children.filter(c => c instanceof Mesh && c.geometry instanceof PlaneGeometry);
    });

    test('should earth has 2 routes', () => {
        expect(routes.length).toBe(2);
    });

    test('should earth has 2 info panels', () => {
        expect(infoPanels.length).toBe(2);
    });
});