import * as THREE from "three";

/**
 * @param size: number
 * @param options
 * @return {[]}
 */
export const colormap = (size, options = {}) => {
    const begin = options.begin || new THREE.Color('#1E9600');
    const middle = options.middle || new THREE.Color('#FFF200');
    const end = options.end || new THREE.Color('#FF0000');

    const colors = [];
    const span = size - 1;
    const halfSpan = span / 2;
    for (let i = 0; i < size; ++i) {
        if (i < halfSpan) {
            colors.push(begin.clone().lerp(middle, i / halfSpan));
        } else {
            colors.push(middle.clone().lerp(end, (i - halfSpan) / halfSpan));
        }
    }

    return colors;
};
