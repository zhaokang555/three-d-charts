export default class ChinaProvinceBarChartAlgorithms {
    /**
     * @param r: number
     * @param lon: number
     * @param lat: number
     * @return {[number, number, number]}
     */
    static getXYZByLonLat = (r, lon, lat) => {
        /**
         x = R * cos(lat) * sin(lon)
         y = R * sin(lat)
         z = R * cos(lat) * cos(lon)
         */

        return [
            r * Math.cos(lat / 180 * Math.PI) * Math.sin(lon / 180 * Math.PI),
            r * Math.sin(lat / 180 * Math.PI),
            r * Math.cos(lat / 180 * Math.PI) * Math.cos(lon / 180 * Math.PI),
        ]
    };
}