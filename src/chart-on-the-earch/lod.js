import * as THREE from "three";
import earth_nightmap_3600x1800 from "./BlackMarble_2016_01deg_3600x1800.jpeg";

/**
 * @return {THREE.Texture}
 */
export const getTextureOfLevel0 = () => {
    const loader = new THREE.TextureLoader();
    const map = loader.load(earth_nightmap_3600x1800);
    map.wrapS = THREE.RepeatWrapping; // 纹理将简单地重复到无穷大
    map.wrapT = THREE.RepeatWrapping;
    // 默认情况下: 贴图从x轴负方向开始, 沿着逆时针方向到x轴负方向结束. 伦敦位于x轴正方向上
    // 将贴图顺时针旋转90度后: 贴图从z轴负方向开始, 沿着逆时针方向到z轴负方向结束. 伦敦位于z轴正方向上
    map.offset.x = 0.25; // why not -0.25 ?

    return map;
};
