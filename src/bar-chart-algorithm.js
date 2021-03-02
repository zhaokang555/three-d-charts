import {CUBE_GAP, CUBE_WIDTH} from "./constant";

export const getPositionOfNthBar = (n, value) => {
    return [
        (2 * n + 1) * CUBE_GAP + CUBE_WIDTH * (2 * n + 1) / 2,
        value / 2,
        0 - (CUBE_WIDTH / 2 + CUBE_GAP)
    ]
};