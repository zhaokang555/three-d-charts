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
}