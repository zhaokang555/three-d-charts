import * as THREE from "three";
import Constant from "../constant";
const {earthRadius} = Constant;

export default class BarChartOnTheEarthAlgorithms {
    /**
     * @param r: number 到地心的距离
     * @param lon: number 经度
     * @param lat: number 纬度
     * @return {[number, number, number]}
     */
    static getXYZByLonLat = (r, lon, lat) => {
        const {sin, cos, PI} = Math;
        const lonRadian = lon / 180 * PI;
        const latRadian = lat / 180 * PI;

        const y = r * sin(latRadian); // 在经线圈平面上, 计算y

        const rOnEquatorialPlane = r * cos(latRadian); // 在赤道面上, 计算r的投影距离
        const x = rOnEquatorialPlane * sin(lonRadian); // 在俯视图中, 计算x
        const z = rOnEquatorialPlane * cos(lonRadian); // 在俯视图中, 计算z

        /**
         x = R * cos(lat) * sin(lon)
         y = R * sin(lat)
         z = R * cos(lat) * cos(lon)
         */
        return [x, y, z];
    };

    /**
     * @param scene
     * @param fromCoordinates: [number, number];
     * @param toCoordinates: [number, number];
     * @return {THREE.Vector3}
     */
    static getControlPointPosition = (scene, fromCoordinates, toCoordinates) => {
        const getXYZByLonLat = BarChartOnTheEarthAlgorithms.getXYZByLonLat;
        const Vector3 = THREE.Vector3;

        const fromPosition = new Vector3(...getXYZByLonLat(earthRadius, ...fromCoordinates));
        const toPosition = new Vector3(...getXYZByLonLat(earthRadius, ...toCoordinates));

        // 在经过起始点的大圆上取两个控制点
        const midpointPositionList = [];
        midpointPositionList.push(fromPosition.clone().lerp(toPosition, 0.49)); // 插值
        midpointPositionList.push(fromPosition.clone().lerp(toPosition, 0.51)); // 插值

        const earthMesh = scene.getObjectByName('earthMesh');
        if (earthMesh) {
            midpointPositionList.forEach(midpointPosition => {
                const raycaster = new THREE.Raycaster(new Vector3(), midpointPosition.clone().normalize()); // 从地心向中点的方向发射射线
                const intersects = raycaster.intersectObject(earthMesh);
                if (intersects.length > 0) {
                    const midpointPositionOnTheEarth = intersects[0].point;
                    const distance = fromPosition.distanceTo(toPosition);
                    const maxDistance = earthRadius * 2;
                    midpointPosition.copy(midpointPositionOnTheEarth.multiplyScalar(1.1 + 2 * distance / maxDistance));
                }
            });
        }

        return midpointPositionList;
    };
}