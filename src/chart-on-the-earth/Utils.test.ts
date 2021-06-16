import { AmbientLight, DirectionalLight, Scene } from 'three';
import { addLightToScene } from './Utils';

describe('chart-on-the-earth/Utils', () => {
    test('addLightToScene', () => {
        const scene = new Scene();

        addLightToScene(scene, 0.2);

        const directionalLights = scene.children.filter(c => c instanceof DirectionalLight);
        const ambientLights = scene.children.filter(c => c instanceof AmbientLight) as Array<AmbientLight>;

        expect(directionalLights.length).toBe(1);
        expect(ambientLights.length).toBe(1);
        expect(ambientLights[0].intensity).toBeCloseTo(0.2);
    });
});