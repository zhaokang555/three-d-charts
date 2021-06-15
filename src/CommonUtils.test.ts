import { getOrthographicCamera } from './CommonUtils';

test('getOrthographicCamera', () => {
    const div = {offsetWidth: 800, offsetHeight: 600} as HTMLElement;

    const camera = getOrthographicCamera(div, 100);
    const aspectRatio = (camera.right - camera.left) / (camera.top - camera.bottom);

    expect(aspectRatio).toBeCloseTo(800 / 600);
});