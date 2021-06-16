import { AmbientLight, PointLight, Scene } from 'three';
import { addBarsToScene, addKeysOnTopToScene, addLightToScene, addValuesToScene } from './Utils';
import { BarMesh } from './BarMesh';

describe('bar-chart/Utils', () => {
    let scene;

    beforeEach(() => {
        scene = new Scene();
    });

    test('addLightToScene', () => {
        addLightToScene(scene, 100);

        const ambientLights = scene.children.filter(c => c instanceof AmbientLight) as Array<AmbientLight>;
        const pointLights = scene.children.filter(c => c instanceof PointLight) as Array<PointLight>;

        expect(ambientLights.length).toBe(1);
        expect(pointLights.length).toBe(1);
        expect(pointLights[0].position.y).toBeCloseTo(100);
    });

    test('addBarsToScene', () => {
        const bars = addBarsToScene(scene, [7, 8, 9]);

        expect(bars.length).toBe(3);
        expect(bars[0].value).toBe(7);
        expect(bars[1].value).toBe(8);
        expect(bars[2].value).toBe(9);
    });

    test('addValuesToScene', () => {
        const mockBars = [
            {
                height: 3,
                position: {x: 100, z: 200},
            },
            {
                height: 4,
                position: {x: 100, z: 200},
            },
            {
                height: 5,
                position: {x: 100, z: 200},
            },
        ] as Array<BarMesh>;
        const valueTextMeshes = addValuesToScene(scene, [3, 4, 5], 1, mockBars);

        expect(valueTextMeshes.length).toBe(3);
    });
});