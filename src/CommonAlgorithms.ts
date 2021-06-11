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

export const getTextColorByBackgroundColor = (color: Color) => {
    const {r, g, b} = color;

    // see: https://zh.wikipedia.org/wiki/YIQ
    // https://www.w3.org/TR/AERT/#color-contrast
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    return brightness > 0.49 ? 'black' : 'white'; // 0.49 = 125 / 255
};
