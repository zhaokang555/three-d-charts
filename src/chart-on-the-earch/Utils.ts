import china_geo_json from "./china.geo.json";
import cities from './cities.json';
import { colormap } from '../CommonAlgorithms';
import earth_specular_map from './8k_earth_specular_map.png';
import earth_clouds from './2k_earth_clouds.jpeg';
import earth_nightmap from './BlackMarble_2016_3km_13500x6750.jpeg';
import ICity from '../type/ICity';
import IRoute from '../type/IRoute';
import ICube from '../type/ICube';
import IRing from '../type/IRing';
import ICoordinates from '../type/ICoordinates';
import {
    AmbientLight,
    AxesHelper,
    BoxGeometry,
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
import { barAltitude, cloudAltitude, defaultCubeColorRed, defaultLightColorWhite, earthRadius } from '../Constant';
import ICamera from '../type/ICamera';
import IList from '../type/IList';
import { Curve } from 'three/src/extras/core/Curve';
import { Vector3 } from 'three/src/math/Vector3';


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

export const addEarthMeshToScene = (scene: Scene, camera: ICamera): () => void => {
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
    earthMesh.position.set(0, 0, 0);
    earthMesh.name = 'earthMesh';
    const cloudMesh = _addCloudMeshToEarthMesh(earthMesh);
    scene.add(earthMesh);

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

export const addBarsToScene = (scene: Scene, list: IList) => {
    const values = list.map(kv => kv.value);
    const maxValue = Math.max(...values);
    const maxBarHeight = 0.5 * earthRadius;

    const colors = colormap(100);

    list.forEach(kv => {
        const barHeight = kv.value / maxValue * maxBarHeight;
        const colorIndex = Math.round(kv.value / maxValue * 99); // colorIndex = 0, 1, 2, ..., 99
        const color = colors[colorIndex];
        _addBarToScene(kv.key, barHeight, color, scene);
    });
};

export const addRoutesToScene = (scene: Scene, list: Array<IRoute>, extraCities: Array<ICity>): () => void => {
    const maxWeight = Math.max(...list.map(line => line.weight));
    const mergedCities = [...cities, ...extraCities];

    const updateRouteMeshList = [];
    list.forEach(({from, to, weight}) => {
        const fromCity = mergedCities.find(item => item.name === from);
        const toCity = mergedCities.find(item => item.name === to);
        if (fromCity && toCity) {
            const curve = _getRouteCurve(scene, fromCity, toCity);
            const [routeMesh, updateRouteMesh] = _getRouteMeshOfTube(curve, weight, maxWeight);
            scene.add(routeMesh);
            updateRouteMeshList.push(updateRouteMesh);
        }
    });

    return () => updateRouteMeshList.forEach(cb => cb());
};

export const _getRouteCurve = (scene: Scene, fromCity: ICity, toCity: ICity) => {
    const fromVec = getPositionByLonLat(...fromCity.coordinates);
    const toVec = getPositionByLonLat(...toCity.coordinates);

    const controlPointVec = getControlPointPosition(scene, fromCity.coordinates, toCity.coordinates);

    return new CubicBezierCurve3( // 三维三次贝塞尔曲线
        fromVec,
        ...controlPointVec,
        toVec
    );
};

export const _getRouteMeshOfTube = (curve: Curve<Vector3>, weight: number, maxWeight: number): [Mesh, () => void] => {
    const geometry = new TubeGeometry(curve, 64, 0.002 * earthRadius, 8, false);
    // 1 using MeshPhongMaterial
    const texture = _createRouteTexture();
    const material = new MeshBasicMaterial({
        map: texture,
        transparent: true,
    });

    const speed = weight / maxWeight * (1 / 60); // max speed = 1 / 60
    return [new Mesh(geometry, material), () => texture.offset.x -= speed];
};

export const _createRouteTexture = () => {
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
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(0.98, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.99, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 100, 1);
    const texture = new CanvasTexture(canvas, null, RepeatWrapping, RepeatWrapping);

    return texture;
};

export const _addBarToScene = (provinceName: string, barHeight: number, color: Color, scene: Scene) => {
    const province = china_geo_json.features.find(f => f.properties.name === provinceName);
    const center = province.properties.center;
    const r = earthRadius + barAltitude;

    _addCubeToScene(center, barHeight, r, color, scene);

    /**
     *  个人理解:
     *  province.geometry.coordinates: Array<MultiPolygon> 如: 台湾省
     *  MultiPolygon: Array<Polygon> 如: 台湾岛, 钓鱼岛, ...
     *  Polygon: Array<Ring> 如: 台湾岛外边界, 日月潭外边界, ...
     *  Ring: Array<[lan, lat]>
     */
    province.geometry.coordinates.forEach(polygon => { // all province.geometry.type === 'MultiPolygon'
        polygon.forEach(ring => _addLineToScene(ring, r, scene));
    });
};

export const _addCubeToScene = (center: ICoordinates, barHeight: number, r: number, color: Color, scene: Scene) => {
    const centerPosition = getPositionByLonLat(...center, r);
    const cubeWidth = earthRadius * 0.025; // set bottom side length
    const cube = new Mesh(
        new BoxGeometry(cubeWidth, barHeight, cubeWidth),
        new MeshPhongMaterial({
            color,
            side: DoubleSide,
        }),
    ) as ICube;
    cube.position.copy(centerPosition);
    const up = cube.up.clone().normalize();
    cube.quaternion.setFromUnitVectors(up, centerPosition.clone().normalize());
    cube.translateY(barHeight / 2);
    cube.defaultColor = color; // store default color in cube mesh object
    scene.add(cube);
};

const _addLineToScene = (ring: IRing, r: number, scene: Scene) => {
    const points = [];
    ring.forEach(lonLat => {
        points.push(getPositionByLonLat(...lonLat, r));
    });
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({color: defaultCubeColorRed});
    const line = new Line(geometry, material);
    scene.add(line);
};

const _addCloudMeshToEarthMesh = (earthMesh: Mesh): Mesh<SphereGeometry, MeshBasicMaterial> => {
    const loader = new TextureLoader();
    const geometry = new SphereGeometry(earthRadius + cloudAltitude, 64, 64);
    const material = new MeshBasicMaterial({
        map: loader.load(earth_clouds),
        opacity: 0.2,
        transparent: true,
    });
    const cloudMesh = new Mesh(geometry, material);
    cloudMesh.name = 'cloudMesh';
    earthMesh.add(cloudMesh);
    return cloudMesh;
};
