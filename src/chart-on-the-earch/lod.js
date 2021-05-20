import * as THREE from "three";
import earth_nightmap_3600x1800 from "./BlackMarble_2016_01deg_3600x1800.jpeg";
import Constant from '../constant';
import UpdatableTexture from '../lib/UpdatableTexture';
import {Texture} from "three";

const {earthRadius} = Constant;

export const getTextureByDistance = (camera) => {
    const distance = camera.position.distanceTo(new THREE.Vector3());
    console.log(distance);
    if (distance > 1.5 * earthRadius) {
        return getTextureOfLevel0();
    }
};

/**
 * @return {THREE.Texture}
 */
export const getTextureOfLevel0 = (renderer) => {
    const texture = new UpdatableTexture(THREE.RGBFormat);
    texture.wrapS = THREE.RepeatWrapping; // 纹理将简单地重复到无穷大
    texture.wrapT = THREE.RepeatWrapping;
    // 默认情况下: 贴图从x轴负方向开始, 沿着逆时针方向到x轴负方向结束. 伦敦位于x轴正方向上
    // 将贴图顺时针旋转90度后: 贴图从z轴负方向开始, 沿着逆时针方向到z轴负方向结束. 伦敦位于z轴正方向上
    texture.offset.x = 0.25; // why not -0.25 ?
    texture.setRenderer( renderer );

    const loader = new THREE.ImageLoader();
    loader.load(earth_nightmap_3600x1800, image => {
        texture.setSize( image.width, image.height );
        texture.update( image, 0, 0 );
    });
    window.texture = texture;
    return texture;
};

export const updateTextureOfLevel1ByCoordinates = (texture, lon, lat) => {
    texture.setSize( 13500, 6750 );

    const lineIdx = Math.min(Math.floor((90 - lat) / 90), 2);
    const colIdx = Math.min(Math.floor((lon + 180) / 90), 3);
    const tilePath = `/tiles_level_1/tile_${lineIdx}_${colIdx}_3375x3375.jpeg`;

    const loader = new THREE.ImageLoader();
    loader.load(tilePath, image => {
        texture.update( image, colIdx * image.width, lineIdx * image.height );
    });
};

window.updateTextureOfLevel1ByCoordinates = updateTextureOfLevel1ByCoordinates;