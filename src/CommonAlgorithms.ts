import { Color } from 'three';

type IOptions = {
    begin?: Color;
    middle?: Color;
    end?: Color;
};
export const colormap = (size: number, options: IOptions = {}): Array<Color> => {
    const begin = options.begin || new Color('#1E9600');
    const middle = options.middle || new Color('#FFF200');
    const end = options.end || new Color('#FF0000');

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
