export default class ChinaProvinceBarChartAlgorithms {
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

        const y = r * sin(latRadian);

        const rOnEquatorialPlane = r * cos(latRadian);
        const x = rOnEquatorialPlane * cos(lonRadian);
        const z = rOnEquatorialPlane * sin(lonRadian);

        /**
         x = R * cos(lat) * cos(lon)
         y = R * sin(lat)
         z = R * cos(lat) * sin(lon)
         */
        return [x, y, z];
    };
}