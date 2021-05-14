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
        lon = -lon; // 在我们的坐标系下, 东经为负数
        const {sin, cos, PI} = Math;
        const lonRadian = lon / 180 * PI;
        const latRadian = lat / 180 * PI;

        const y = r * sin(latRadian); // 在经线圈平面上, 计算y

        const rOnEquatorialPlane = r * cos(latRadian); // 在赤道面（XY坐标系）上, 计算r的投影距离
        const x = rOnEquatorialPlane * cos(lonRadian); // 在俯视图中, 计算x
        const z = rOnEquatorialPlane * sin(lonRadian); // 在俯视图中, 计算x

        /**
         x = R * cos(lat) * cos(lon)
         y = R * sin(lat)
         z = R * cos(lat) * sin(lon)
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

        const midpointPositionInTheEarth = fromPosition.lerp(toPosition, 0.5); // 插值

        const raycaster = new THREE.Raycaster(new Vector3(), midpointPositionInTheEarth.normalize());
        const earthMesh = scene.getObjectByName('earthMesh');
        if (earthMesh) {
            const intersects = raycaster.intersectObject(earthMesh);
            if (intersects.length > 0) {
                const midpointPositionOnTheEarth = intersects[0].point;
                const distance = fromPosition.distanceTo(toPosition);
                const maxDistance = earthRadius * 2;
                return midpointPositionOnTheEarth.multiplyScalar(1.1 + 2 * distance / maxDistance);
            }
        }
        return new Vector3();
    };
}