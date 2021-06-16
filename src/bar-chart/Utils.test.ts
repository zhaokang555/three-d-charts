import { PointLight, Scene } from 'three';
import { addLightToScene } from './Utils';

describe('bar-chart/Utils', () => {
    test('addLightToScene', () => {
        const scene = new Scene();

        addLightToScene(scene, 100);

        const pointLights = scene.children.filter(c => c instanceof PointLight) as Array<PointLight>;
        expect(pointLights.length).toBe(1);
        expect(pointLights[0].position.y).toBeCloseTo(100);
    });
});