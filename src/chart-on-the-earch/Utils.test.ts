import { AmbientLight, DirectionalLight, Scene } from 'three';
import { addLightToScene } from './Utils';

describe('Utils', () => {
    test('addLightToScene', () => {
        const scene = new Scene();

        addLightToScene(scene, 0.2);

        const directionalLights = scene.children.filter(c => c instanceof DirectionalLight);
        const ambientLight = scene.children.filter(c => c instanceof AmbientLight) as Array<AmbientLight>;

        expect(directionalLights.length).toBe(1);
        expect(ambientLight.length).toBe(1);
        expect(ambientLight[0].intensity).toBeCloseTo(0.2);
    });
});