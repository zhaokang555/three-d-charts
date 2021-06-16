import { DoubleSide, Mesh, MeshPhongMaterial, RepeatWrapping, SphereGeometry, TextureLoader } from 'three';
import earth_nightmap from '../chart-on-the-earth/BlackMarble_2016_3km_13500x6750.jpeg';
import earth_specular_map from '../chart-on-the-earth/8k_earth_specular_map.png';
import { earthRadius } from '../Constant';

export class EarthMesh extends Mesh<SphereGeometry, MeshPhongMaterial> {
    constructor() {
        const map = new TextureLoader().load(earth_nightmap);
        map.wrapS = RepeatWrapping;// 纹理将简单地重复到无穷大
        map.wrapT = RepeatWrapping;

        // 默认情况下: 贴图从x轴负方向开始, 沿着逆时针方向到x轴负方向结束. 伦敦位于x轴正方向上
        // 将贴图顺时针旋转90度后: 贴图从z轴负方向开始, 沿着逆时针方向到z轴负方向结束. 伦敦位于z轴正方向上
        map.offset.x = 0.25; // why not -0.25 ?

        const specularMap = new TextureLoader().load(earth_specular_map);
        specularMap.wrapS = RepeatWrapping;
        specularMap.wrapT = RepeatWrapping;
        specularMap.offset.x = 0.25; // why not -0.25 ?

        const material = new MeshPhongMaterial({
            map,
            specularMap, // 镜面反射贴图
            specular: '#808080',
            shininess: 22,
            side: DoubleSide,
        });

        const geometry = new SphereGeometry(earthRadius, 64, 64);
        super(geometry, material);
        this.name = 'earthMesh';
    }
}