import { FontLoader, Vector3 } from 'three';
import helvetiker_regular from '../helvetiker_regular.typeface.json';
import { TextMesh } from './TextMesh';
import ICamera from '../type/ICamera';

describe('TextMesh', () => {
    test('lookAtCamera', () => {
        const loader = new FontLoader();
        const font = loader.parse(helvetiker_regular);

        const textMesh = new TextMesh('text', font, 12);
        const spy = jest.spyOn(textMesh, 'lookAt');

        const mockCamera = {position: new Vector3(3, 4, 5)} as ICamera;
        textMesh.lookAtCamera(mockCamera);

        expect(spy).toHaveBeenCalledTimes(1);

        const lookAtPosition = spy.mock.calls[0][0] as Vector3;
        expect(lookAtPosition.x).toBeCloseTo(3);
        expect(lookAtPosition.y).toBeCloseTo(0);
        expect(lookAtPosition.z).toBeCloseTo(5);
    });
});