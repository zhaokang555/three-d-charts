import {
    BufferGeometry,
    Color,
    DoubleSide,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshPhongMaterial,
    RepeatWrapping,
    SphereGeometry,
    TextureLoader
} from 'three';
import earth_nightmap from '../chart-on-the-earch/BlackMarble_2016_3km_13500x6750.jpeg';
import earth_specular_map from '../chart-on-the-earch/8k_earth_specular_map.png';
import { barAltitude, defaultBarColorRed, earthRadius } from '../Constant';
import IList from '../type/IList';
import ICoordinates from '../type/ICoordinates';
import IRing from '../type/IRing';
import { colormap } from '../CommonAlgorithms';
import china_geo_json from '../chart-on-the-earch/china.geo.json';
import { getPositionByLonLat } from '../chart-on-the-earch/Algorithms';
import { BarMesh } from './BarMesh';

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

    addProvinces(list: IList) {
        const values = list.map(kv => kv.value);
        const maxValue = Math.max(...values);
        const maxBarHeight = 0.5 * earthRadius;

        const colors = colormap(100);

        list.forEach(kv => {
            const barHeight = kv.value / maxValue * maxBarHeight;
            const colorIndex = Math.round(kv.value / maxValue * 99); // colorIndex = 0, 1, 2, ..., 99
            const color = colors[colorIndex];
            this._addProvince(kv.key, kv.value, barHeight, color);
        });
        return this;
    }

    private _addProvince(key: string, value: number, barHeight: number, color: Color) {
        const province = china_geo_json.features.find(f => f.properties.name === key);
        const center = province.properties.center;

        this._addBar(center, barHeight, color, key, value);

        /**
         *  个人理解:
         *  province.geometry.coordinates: Array<MultiPolygon> 如: 台湾省
         *  MultiPolygon: Array<Polygon> 如: 台湾岛, 钓鱼岛, ...
         *  Polygon: Array<Ring> 如: 台湾岛外边界, 日月潭外边界, ...
         *  Ring: Array<[lan, lat]>
         */
        province.geometry.coordinates.forEach(polygon => { // all province.geometry.type === 'MultiPolygon'
            polygon.forEach(ring => this._addProvincialBoundary(ring));
        });
    }

    private _addBar(center: ICoordinates, barHeight: number, color: Color, key: string, value: number) {
        const centerPosition = getPositionByLonLat(...center, earthRadius + barAltitude);
        const barWidth = earthRadius * 0.025; // set bottom side length

        const bar = new BarMesh(barWidth, value, color, key, barHeight);
        bar.position.copy(centerPosition);
        const up = bar.up.clone().normalize();
        bar.quaternion.setFromUnitVectors(up, centerPosition.clone().normalize());
        bar.translateY(barHeight / 2);
        this.add(bar);
    }

    private _addProvincialBoundary(ring: IRing) {
        const points = [];
        ring.forEach(lonLat => {
            points.push(getPositionByLonLat(...lonLat, earthRadius + barAltitude));
        });
        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({color: defaultBarColorRed});
        const line = new Line(geometry, material);
        this.add(line);
    }
}