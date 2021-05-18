import * as THREE from "three";
import china_geo_json from "./china.geo.json";
import cities from './cities.json';
import BarChartOnTheEarthAlgorithms from "./bar-chart-on-the-earth-algorithms";
import Constant from "../constant";
import colormap from 'colormap';
import earth_nightmap from './BlackMarble_2016_3km.jpg';
import earth_specular_map from './8k_earth_specular_map.png';
import earth_clouds from './8k_earth_clouds.png';
import routeTexture from './route.png';
import routeVert from './route.vert';
import routeFrag from './route.frag';

const {earthRadius, defaultCubeColorRed, barAltitude, cloudAltitude} = Constant;

export default class Utils {
    static addLightToScene = (scene, ambientLightIntensity = 0.7) => {
        const light = new THREE.DirectionalLight(Constant.defaultLightColorWhite, 0.7);
        const lonRadianOfUtc8 = -120 / 180 * Math.PI; // XZ坐标系下, 东八区经度对应的弧度
        light.position.set(Math.cos(lonRadianOfUtc8), 0, Math.sin(lonRadianOfUtc8)); // 平行光的位置，直射东八区。例如：如果设置为(0, 1, 0), 那么光线将会从上往下照射。

        scene.add(light);
        scene.add(new THREE.AmbientLight(Constant.defaultLightColorWhite, ambientLightIntensity));
    };

    static getPerspectiveCamera = () => {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001 * earthRadius, 20 * earthRadius);
        const lonRadianOfUtc8 = -120 / 180 * Math.PI; // XZ坐标系下, 东八区经度对应的弧度
        const rCamera = 2 * earthRadius; // 相机到地心距离

        camera.position.set(Math.cos(lonRadianOfUtc8) * rCamera, 0, Math.sin(lonRadianOfUtc8) * rCamera); // 东8区, 纬度0度
        return camera;
    };
    static addEarthMeshToScene = (scene) => {
        const loader = new THREE.TextureLoader();
        const map = loader.load(earth_nightmap);
        const specularMap = loader.load(earth_specular_map);

        // const material = new THREE.MeshPhongMaterial({
        //     color: defaultCubeColorRed,
        //     specular: '#ffffff',
        //     shininess: 100,
        //     side: THREE.DoubleSide,
        // });
        const material = new THREE.MeshPhongMaterial( {
            map,
            specularMap, // 镜面反射贴图
            specular: '#808080',
            shininess: 22,
            side: THREE.DoubleSide,
        } );

        const geometry = new THREE.SphereGeometry(earthRadius, 64, 64);
        const earthMesh = new THREE.Mesh(geometry, material);
        earthMesh.position.set(0, 0, 0);
        earthMesh.name = 'earthMesh';
        // earthMesh.rotateY(-Math.PI / 2);

        // ChinaProvinceBarChartUtils._addCloudMeshToEarthMesh(earthMesh);

        scene.add(earthMesh);
    };

    /**
     * @param scene
     * @param list: Array<{
     *     key: string;
     *     value: string;
     * }>
     */
    static addBarsToScene(scene, list) {
        const values = list.map(kv => kv.value);
        const maxValue = Math.max(...values);
        const maxBarHeight = 0.5 * earthRadius;

        // bigger value has a darker color, see: https://github.com/bpostlethwaite/colormap
        const colors = colormap({colormap: 'hot', nshades: 140}).slice(40); // do not use color which is too dark

        list.forEach(kv => {
            const barHeight = kv.value / maxValue * maxBarHeight;
            const colorIndex = Math.round(kv.value / maxValue * 99); // colorIndex = 0, 1, 2, ..., 99
            const color = colors[colorIndex];
            Utils._addBarToScene(kv.key, barHeight, color, scene);
        });
    }

    /**
     * @param scene
     * @param list: Array<{
     *     from: string;
     *     to: string;
     *     weight: number;
     * }>
     * @return {function}
     */
    static addRoutesToScene(scene, list) {
        const maxWeight = Math.max(...list.map(line => line.weight));
        const textureAndSpeedList = [];

        list.forEach(({from, to, weight}) => {
            const fromCity = cities.find(item => item.name === from);
            const toCity = cities.find(item => item.name === to);
            if (fromCity && toCity) {
                const curve = Utils._getRouteCurve(scene, fromCity, toCity);
                const route = Utils._getRouteMeshOfTube(curve, weight, maxWeight, textureAndSpeedList);
                scene.add(route);
            }
        });

        return () => {
            textureAndSpeedList.forEach(({texture: t, speed: s}) => t.offset.x -= s);
        };
    }

    /**
     * @param scene
     * @param fromCity: {coordinates: [number, number]}
     * @param toCity: {coordinates: [number, number]}
     * @return {THREE.CubicBezierCurve3}
     * @private
     */
    static _getRouteCurve = (scene, fromCity, toCity) => {
        const fromVec = new THREE.Vector3(...BarChartOnTheEarthAlgorithms.getXYZByLonLat(
            earthRadius,
            fromCity.coordinates[0],
            fromCity.coordinates[1]
        ));
        const toVec = new THREE.Vector3(...BarChartOnTheEarthAlgorithms.getXYZByLonLat(
            earthRadius,
            toCity.coordinates[0],
            toCity.coordinates[1]
        ));

        const controlPointVec = BarChartOnTheEarthAlgorithms.getControlPointPosition(scene, fromCity.coordinates, toCity.coordinates);

        return new THREE.CubicBezierCurve3( // 三维三次贝塞尔曲线
            fromVec,
            ...controlPointVec,
            toVec
        );
    };

    static _getRouteMeshOfLine = (curve) => {
        const points = curve.getPoints( 50 );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color : '#ff0000' } );
        return new THREE.Line( geometry, material );
    };

    static _getRouteMeshOfTube = (curve, weight, maxWeight, textureAndSpeedList) => {
        const texture = Utils._createRouteTexture();
        const speed = weight / maxWeight * (1 / 60); // max speed = 1 / 60
        textureAndSpeedList.push({texture, speed});

        const geometry = new THREE.TubeGeometry( curve, 64, 0.002 * earthRadius, 8, false );
        // 1 using MeshPhongMaterial
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
        });
        // 2 using shader
        // const material = new THREE.ShaderMaterial({
        //     uniforms: {
        //         color: { value: new THREE.Vector4(1, 1) }
        //     },
        //     vertexShader: routeVert,
        //     fragmentShader: routeFrag,
        //     transparent: true
        // });
        return new THREE.Mesh( geometry, material );
    };

    static _createRouteTexture = () => {
        // const loader = new THREE.TextureLoader();
        // const texture = loader.load(routeTexture);
        // texture.wrapS = THREE.RepeatWrapping; // 纹理将简单地重复到无穷大
        // texture.wrapT = THREE.RepeatWrapping;
        // // texture.repeat.x = 2; // 纹理重复几次, 默认1次

        // OR

        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0,0,100,0);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.1)');
        grad.addColorStop(0.98, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.99, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,100,1);
        const texture = new THREE.CanvasTexture(canvas, null, THREE.RepeatWrapping, THREE.RepeatWrapping);
        return texture;
    };

    static _addBarToScene = (provinceName, barHeight, color, scene) => {
        const province = china_geo_json.features.find(f => f.properties.name === provinceName);
        const center = province.properties.center;
        const r = earthRadius + barAltitude;

        Utils._addCubeToScene(center, barHeight, r, color, scene);

        /**
         *  个人理解:
         *  province.geometry.coordinates: Array<MultiPolygon> 如: 台湾省
         *  MultiPolygon: Array<Polygon> 如: 台湾岛, 钓鱼岛, ...
         *  Polygon: Array<Ring> 如: 台湾岛外边界, 日月潭外边界, ...
         *  Ring: Array<[lan, lat]>
         */
        province.geometry.coordinates.forEach(polygon => { // all province.geometry.type === 'MultiPolygon'
            polygon.forEach(ring => Utils._addLineToScene(ring, r, scene));
        });
    };

    /**
     * @param center: [number, number]
     * @param barHeight: number
     * @param r: number
     * @param color: string; like: #000000
     * @param scene
     * @private
     */
    static _addCubeToScene(center, barHeight, r, color, scene) {
        const centerXYZ = BarChartOnTheEarthAlgorithms.getXYZByLonLat(r, center[0], center[1]);
        const cubeWidth = earthRadius * 0.025; // set bottom side length
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(cubeWidth, barHeight, cubeWidth),
            new THREE.MeshPhongMaterial({
                color,
                side: THREE.DoubleSide,
            }),
        );
        cube.position.set(...centerXYZ);
        const up = cube.up.clone().normalize();
        const normal = new THREE.Vector3(...centerXYZ).normalize();
        cube.quaternion.setFromUnitVectors(up, normal);
        cube.translateY(barHeight / 2);
        scene.add(cube);
    }

    /**
     * @param ring: Array<[number, number]>
     * @param r: number
     * @param scene
     * @private
     */
    static _addLineToScene(ring, r, scene) {
        const points = [];
        ring.forEach(lonLat => {
            const [x, y, z] = BarChartOnTheEarthAlgorithms.getXYZByLonLat(r, lonLat[0], lonLat[1]);
            points.push(new THREE.Vector3(x, y, z));
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial( { color: defaultCubeColorRed } );
        const line = new THREE.Line( geometry, material );
        scene.add(line);
    }

    static _addCloudMeshToEarthMesh(earthMesh) {
        const loader = new THREE.TextureLoader();
        const geometry = new THREE.SphereGeometry(earthRadius + cloudAltitude, 64, 64);
        const material  = new THREE.MeshLambertMaterial({
            map: loader.load(earth_clouds),
            side: THREE.DoubleSide,
            opacity: 0.5,
            transparent: true,
            emissive: '#333333', // 自发光
        });
        const cloudMesh = new THREE.Mesh(geometry, material);
        cloudMesh.name = 'cloudMesh';
        earthMesh.add(cloudMesh);
    }
}