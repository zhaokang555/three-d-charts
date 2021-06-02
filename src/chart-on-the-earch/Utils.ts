import china_geo_json from "./china.geo.json";
import cities from './cities.json';
import { colormap, getLookAtPosition } from '../CommonAlgorithms';
import earth_specular_map from './8k_earth_specular_map.png';
import earth_clouds from './2k_earth_clouds.jpeg';
import earth_nightmap from './BlackMarble_2016_3km_13500x6750.jpeg';
import ICity from '../type/ICity';
import IRoute from '../type/IRoute';
import IRing from '../type/IRing';
import ICoordinates from '../type/ICoordinates';
import {
    AmbientLight,
    AxesHelper,
    BufferGeometry,
    CanvasTexture,
    Color,
    CubicBezierCurve3,
    DirectionalLight,
    DoubleSide,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    RepeatWrapping,
    Scene,
    SphereGeometry,
    TextureLoader,
    TubeGeometry
} from 'three';
import { getControlPointPosition, getPositionByLonLat } from './Algorithms';
import { barAltitude, cloudAltitude, defaultBarColorRed, defaultLightColorWhite, earthRadius } from '../Constant';
import ICamera from '../type/ICamera';
import IList from '../type/IList';
import { Curve } from 'three/src/extras/core/Curve';
import { Vector3 } from 'three/src/math/Vector3';
import {BarMesh} from '../components/BarMesh';
import InfoPanelMesh from '../components/InfoPanelMesh';


export const addLightToScene = (scene: Scene, ambientLightIntensity = 0.7) => {
    const light = new DirectionalLight(defaultLightColorWhite, 0.7);
    light.position.copy(getPositionByLonLat(120, 0)); // 平行光的位置，直射东经120北纬0。例如：如果设置为(0, 1, 0), 那么光线将会从上往下照射。

    scene.add(light);
    scene.add(new AmbientLight(defaultLightColorWhite, ambientLightIntensity));
};

export const getPerspectiveCamera = (container: HTMLElement): ICamera => {
    const camera = new PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.001 * earthRadius, 20 * earthRadius);
    const rCamera = 2 * earthRadius; // 相机到地心距离

    camera.position.copy(getPositionByLonLat(120, 0, rCamera)); // 相机位置东经120北纬0
    camera.name = 'camera';
    return camera;
};

export const addAxesToScene = (scene: Scene) => {
    const axesHelper = new AxesHelper(earthRadius * 4);
    axesHelper.visible = false;
    axesHelper.name = 'axesHelper';
    scene.add(axesHelper);
};

export const addEarthMeshToScene = (scene: Scene) => {
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
    const earthMesh = new Mesh(geometry, material);
    earthMesh.name = 'earthMesh';
    scene.add(earthMesh);
};

export const addProvincesToScene = (scene: Scene, list: IList) => {
    const values = list.map(kv => kv.value);
    const maxValue = Math.max(...values);
    const maxBarHeight = 0.5 * earthRadius;

    const colors = colormap(100);

    list.forEach(kv => {
        const barHeight = kv.value / maxValue * maxBarHeight;
        const colorIndex = Math.round(kv.value / maxValue * 99); // colorIndex = 0, 1, 2, ..., 99
        const color = colors[colorIndex];
        _addProvinceToScene(kv.key, kv.value, barHeight, color, scene);
    });
};

export const addRoutesToScene = (scene: Scene, list: Array<IRoute>, extraCities: Array<ICity>,
                                 camera: ICamera): () => void => {
    const maxWeight = Math.max(...list.map(line => line.weight));
    const mergedCities = [...cities, ...extraCities] as Array<ICity>;

    const updateRouteAndInfoPanelList = [];
    list.forEach(({from, to, weight}) => {
        const fromCity = mergedCities.find(item => item.name === from);
        const toCity = mergedCities.find(item => item.name === to);
        if (fromCity && toCity) {
            const updateRouteAndInfoPanel = _addRouteAndInfoPanelToScene(scene, fromCity, toCity, weight, maxWeight, camera);
            updateRouteAndInfoPanelList.push(updateRouteAndInfoPanel);
        }
    });

    return () => updateRouteAndInfoPanelList.forEach(cb => cb());
};

export const addCloudMeshToScene = (scene: Scene, camera: ICamera): () => void => {
    const loader = new TextureLoader();
    const geometry = new SphereGeometry(earthRadius + cloudAltitude, 64, 64);
    const material = new MeshBasicMaterial({
        map: loader.load(earth_clouds),
        opacity: 0.2,
        transparent: true,
    });
    const cloudMesh = new Mesh(geometry, material);
    cloudMesh.name = 'cloudMesh';
    scene.add(cloudMesh);

    return () => {
        const distance = camera.position.length();
        cloudMesh.material.visible = true;
        cloudMesh.material.opacity = Math.min((distance - earthRadius) / earthRadius * 0.2, 0.4);
        if (cloudMesh.material.opacity < 0.05) {
            cloudMesh.material.visible = false;
            return;
        }
        cloudMesh.rotateX(-0.0002);
        cloudMesh.rotateY(0.0004);
    }
};

const _addRouteAndInfoPanelToScene = (scene: Scene, fromCity: ICity, toCity: ICity,
                              weight: number, maxWeight: number, camera: ICamera): () => void => {
    const curve = _getRouteCurve(scene, fromCity, toCity);
    const [routeMesh, updateRouteMesh] = _getRouteMeshOfTube(curve, weight, maxWeight);
    scene.add(routeMesh);

    const midPointOnCurve = curve.getPointAt(0.5);
    const infoPanel = new InfoPanelMesh(earthRadius * 0.05, fromCity.name + ' - ' + toCity.name, weight);
    const infoPanelOffset = midPointOnCurve.clone().normalize().multiplyScalar(earthRadius * 0.05);
    infoPanel.position.copy(midPointOnCurve.add(infoPanelOffset));
    scene.add(infoPanel);

    return () => {
        updateRouteMesh();
        infoPanel.lookAt(getLookAtPosition(camera, 0, false));
    };
};

const _getRouteCurve = (scene: Scene, fromCity: ICity, toCity: ICity) => {
    const fromVec = getPositionByLonLat(...fromCity.coordinates);
    const toVec = getPositionByLonLat(...toCity.coordinates);

    const controlPointVec = getControlPointPosition(scene, fromCity.coordinates, toCity.coordinates);

    return new CubicBezierCurve3( // 三维三次贝塞尔曲线
        fromVec,
        ...controlPointVec,
        toVec
    );
};

const _getRouteMeshOfTube = (curve: Curve<Vector3>, weight: number, maxWeight: number): [Mesh, () => void] => {
    const geometry = new TubeGeometry(curve, 64, 0.004 * earthRadius, 8, false);
    const texture = _createRouteTexture();
    const material = new MeshBasicMaterial({
        map: texture,
        transparent: true,
    });

    const speed = weight / maxWeight * (1 / 60); // max speed = 1 / 60
    return [new Mesh(geometry, material), () => texture.offset.x -= speed];
};

const _createRouteTexture = () => {
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
};

const _addProvinceToScene = (key: string, value: number, barHeight: number, color: Color, scene: Scene) => {
    const province = china_geo_json.features.find(f => f.properties.name === key);
    const center = province.properties.center;

    _addBarToScene(center, barHeight, color, scene, key, value);

    /**
     *  个人理解:
     *  province.geometry.coordinates: Array<MultiPolygon> 如: 台湾省
     *  MultiPolygon: Array<Polygon> 如: 台湾岛, 钓鱼岛, ...
     *  Polygon: Array<Ring> 如: 台湾岛外边界, 日月潭外边界, ...
     *  Ring: Array<[lan, lat]>
     */
    province.geometry.coordinates.forEach(polygon => { // all province.geometry.type === 'MultiPolygon'
        polygon.forEach(ring => _addLineToScene(ring, scene));
    });
};

const _addBarToScene = (center: ICoordinates, barHeight: number, color: Color, scene: Scene,
                         key: string, value: number) => {
    const centerPosition = getPositionByLonLat(...center, earthRadius + barAltitude);
    const barWidth = earthRadius * 0.025; // set bottom side length

    const bar = new BarMesh(barWidth, value, color, key, barHeight);
    bar.position.copy(centerPosition);
    const up = bar.up.clone().normalize();
    bar.quaternion.setFromUnitVectors(up, centerPosition.clone().normalize());
    bar.translateY(barHeight / 2);
    scene.add(bar);
};

const _addLineToScene = (ring: IRing, scene: Scene) => {
    const points = [];
    ring.forEach(lonLat => {
        points.push(getPositionByLonLat(...lonLat, earthRadius + barAltitude));
    });
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({color: defaultBarColorRed});
    const line = new Line(geometry, material);
    scene.add(line);
};
