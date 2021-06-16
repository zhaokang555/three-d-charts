import { EarthMesh } from './EarthMesh';
import IRoute from '../type/IRoute';
import ICity from '../type/ICity';
import ICamera from '../type/ICamera';
import KeyValueInfoPanelMesh from './KeyValueInfoPanelMesh';
import { cities, earthRadius } from '../Constant';
import { Curve } from 'three/src/extras/core/Curve';
import { Vector3 } from 'three/src/math/Vector3';
import { getControlPointPosition, getPositionByLonLat } from '../chart-on-the-earth/Algorithms';
import { CanvasTexture, CubicBezierCurve3, Mesh, MeshBasicMaterial, RepeatWrapping, TubeGeometry } from 'three';

export class EarthMeshForRoute extends EarthMesh {
    constructor() {
        super();
    }

    addRoutes(list: Array<IRoute>, extraCities: Array<ICity>, camera: ICamera) {
        const maxWeight = Math.max(...list.map(line => line.weight));
        const mergedCities = [...cities, ...extraCities] as Array<ICity>;

        const updateRouteAndInfoPanelList = [];
        list.forEach(({from, to, weight}) => {
            const fromCity = mergedCities.find(item => item.name === from);
            const toCity = mergedCities.find(item => item.name === to);
            if (fromCity && toCity) {
                const updateRouteAndInfoPanel = this._addRouteAndInfoPanel(fromCity, toCity, weight, maxWeight, camera);
                updateRouteAndInfoPanelList.push(updateRouteAndInfoPanel);
            }
        });

        return () => updateRouteAndInfoPanelList.forEach(cb => cb());
    }

    private _addRouteAndInfoPanel(fromCity: ICity, toCity: ICity, weight: number, maxWeight: number, camera: ICamera) {
        const curve = this._getRouteCurve(fromCity, toCity);
        const [routeMesh, updateRouteMesh] = this._getRouteMeshOfTube(curve, weight, maxWeight);
        routeMesh.name = `routeMesh${fromCity.name}-${toCity.name}`;
        this.add(routeMesh);

        const midPointOnCurve = curve.getPointAt(0.5);
        const infoPanel = new KeyValueInfoPanelMesh(earthRadius * 0.05, `${fromCity.name}-${toCity.name}`, weight);
        const infoPanelOffset = midPointOnCurve.clone().normalize().multiplyScalar(earthRadius * 0.05);
        infoPanel.position.copy(midPointOnCurve.add(infoPanelOffset));
        this.add(infoPanel);

        return () => {
            updateRouteMesh();
            infoPanel.lookAt(camera.position);
        };
    }

    private _getRouteCurve(fromCity: ICity, toCity: ICity) {
        const fromVec = getPositionByLonLat(...fromCity.coordinates);
        const toVec = getPositionByLonLat(...toCity.coordinates);

        const controlPointVec = getControlPointPosition(this, fromCity.coordinates, toCity.coordinates);

        return new CubicBezierCurve3( // 三维三次贝塞尔曲线
            fromVec,
            ...controlPointVec,
            toVec
        );
    }

    private _getRouteMeshOfTube(curve: Curve<Vector3>, weight: number, maxWeight: number): [Mesh, () => void] {
        const geometry = new TubeGeometry(curve, 64, 0.004 * earthRadius, 8, false);
        const texture = this._createRouteTexture();
        const material = new MeshBasicMaterial({
            map: texture,
            transparent: true,
        });

        const speed = weight / maxWeight * (1 / 60); // max speed = 1 / 60
        return [new Mesh(geometry, material), () => texture.offset.x -= speed];
    }

    private _createRouteTexture() {
        // 1. use picture as texture
        // const loader = new TextureLoader();
        // const texture = loader.load(routeTexture);
        // texture.wrapS = RepeatWrapping; // 纹理将简单地重复到无穷大
        // texture.wrapT = RepeatWrapping;
        // // texture.repeat.x = 2; // 纹理重复几次, 默认1次

        // 2. OR use canvas as texture
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 100, 0);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(0.98, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 100, 1);
        const texture = new CanvasTexture(canvas, null, RepeatWrapping, RepeatWrapping);

        return texture;
    }
}