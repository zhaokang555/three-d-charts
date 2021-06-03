import { EarthMesh } from './EarthMesh';
import IList from '../type/IList';
import { barAltitude, earthRadius } from '../Constant';
import { colormap } from '../CommonAlgorithms';
import { BufferGeometry, Color, Line, LineBasicMaterial } from 'three';
import china_geo_json from '../chart-on-the-earch/china.geo.json';
import ICoordinates from '../type/ICoordinates';
import { getPositionByLonLat } from '../chart-on-the-earch/Algorithms';
import { BarMesh } from './BarMesh';
import IRing from '../type/IRing';

export class EarthMeshForProvince extends EarthMesh {
    constructor() {
        super();
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
            polygon.forEach(ring => this._addProvincialBoundary(ring, key, color));
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

    private _addProvincialBoundary(ring: IRing, key: string, color: Color) {
        const points = [];
        ring.forEach(lonLat => {
            points.push(getPositionByLonLat(...lonLat, earthRadius + barAltitude));
        });
        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({color: color});
        const line = new Line(geometry, material);
        line.name = 'Line-' + key;
        this.add(line);
    }
}