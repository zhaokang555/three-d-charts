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
    // const loader = new THREE.TextureLoader();
    // const map = loader.load(earth_nightmap_3600x1800);
    // map.wrapS = THREE.RepeatWrapping; // 纹理将简单地重复到无穷大
    // map.wrapT = THREE.RepeatWrapping;
    // // 默认情况下: 贴图从x轴负方向开始, 沿着逆时针方向到x轴负方向结束. 伦敦位于x轴正方向上
    // // 将贴图顺时针旋转90度后: 贴图从z轴负方向开始, 沿着逆时针方向到z轴负方向结束. 伦敦位于z轴正方向上
    // map.offset.x = 0.25; // why not -0.25 ?
    //
    // return map;

    //////////////////////////
    const texture = new UpdatableTexture(THREE.RGBFormat);
    texture.wrapS = THREE.RepeatWrapping; // 纹理将简单地重复到无穷大
    texture.wrapT = THREE.RepeatWrapping;
    // 默认情况下: 贴图从x轴负方向开始, 沿着逆时针方向到x轴负方向结束. 伦敦位于x轴正方向上
    // 将贴图顺时针旋转90度后: 贴图从z轴负方向开始, 沿着逆时针方向到z轴负方向结束. 伦敦位于z轴正方向上
    texture.offset.x = 0.25; // why not -0.25 ?
    texture.setRenderer( renderer );

    const loader = new THREE.ImageLoader();
    loader.load(earth_nightmap_3600x1800, image => {
        console.log(image.width, image.height);
        texture.setSize( image.width, image.height );
        texture.update( image, 0, 0 );
    });
    return texture;
};