import { Raycaster, Scene, Vector3 } from 'three';
import { earthRadius } from "../Constant";
import ICoordinates from '../type/ICoordinates';
import { EarthMesh } from '../components/EarthMesh';

const {sin, cos, PI, asin, acos} = Math;

/**
 * @param lon 经度
 * @param lat 纬度
 * @param r 到地心的距离
 */
export const getPositionByLonLat = (lon: number, lat: number, r = earthRadius): Vector3 => {
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
    return new Vector3(x, y, z);
};

export const getLonLatByPosition = (position: Vector3): ICoordinates => {
    const {x, y, z} = position;
    const r = position.length();

    const latRadian = asin(y / r); // 在经线圈平面上, 计算纬度

    const rOnEquatorialPlane = r * cos(latRadian); // 在赤道面上, 计算r的投影距离
    let lonRadian = 0;
    if (z >= 0) { // 俯视图中, 点位于下方两个象限或x轴上
        lonRadian = asin(x / rOnEquatorialPlane);
    } else if (x >= 0) { // 俯视图中, 点位于右上方象限或者z负半轴上
        lonRadian = PI / 2 + acos(x / rOnEquatorialPlane);
    } else { // 俯视图中, 点位于左上方象限
        lonRadian = -PI / 2 - acos(x / rOnEquatorialPlane);
    }

    const lat = latRadian / PI * 180;
    const lon = lonRadian / PI * 180;
    return [lon, lat];
};

export const getControlPointPosition = (earthMesh: EarthMesh, fromCoordinates: ICoordinates, toCoordinates: ICoordinates): [Vector3, Vector3] => {
    const fromPosition = getPositionByLonLat(...fromCoordinates);
    const toPosition = getPositionByLonLat(...toCoordinates);

    const midpointPositionList = [
        fromPosition.clone().lerp(toPosition, 0.48), // 插值
        fromPosition.clone().lerp(toPosition, 0.52)
    ] as [Vector3, Vector3];

    midpointPositionList.forEach(midpointPosition => {
        const raycaster = new Raycaster(new Vector3(), midpointPosition.clone().normalize()); // 从地心向中点的方向发射射线
        const intersects = raycaster.intersectObject(earthMesh);
        if (intersects.length > 0) {
            const midpointPositionOnTheEarth = intersects[0].point; // 在经过起始点的大圆上取两个控制点
            const distance = greatCircleDistance(fromPosition, toPosition);
            const maxDistance = earthRadius * 2;
            midpointPosition.copy(midpointPositionOnTheEarth.multiplyScalar(1.1 + 0.6 * distance / maxDistance));
        }
    });

    return midpointPositionList;
};

export const greatCircleDistance = (fromPosition: Vector3, toPosition: Vector3, r = earthRadius): number => {
    const angleInRadian = fromPosition.angleTo(toPosition);
    return angleInRadian * r;
};
