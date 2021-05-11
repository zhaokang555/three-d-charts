import * as turf from "@turf/turf";
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
     * @param fromCoordinates: [number, number];
     * @param toCoordinates: [number, number];
     */
    static getCurveHeight = (fromCoordinates, toCoordinates) => {
        const distance = turf.distance(fromCoordinates, toCoordinates, {units: 'kilometers'});
        // 中国两城市最远距离5172km
        return earthRadius * (0.2 + 0.3 * distance / 5172); // 0.2~0.5 * earthRadius
    };
}