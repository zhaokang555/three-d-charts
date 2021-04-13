export default class ChinaProvinceBarChartAlgorithms {
    static getXYZByLonLat = (r, lon, lat) => {
        /**
         x = R * cos(lat) * cos(lon)
         y = R * cos(lat) * sin(lon)
         z = R * sin(lat)
         */

        return [
            r * Math.cos(lat) * Math.cos(lon),
            r * Math.cos(lat) * Math.sin(lon),
            r * Math.sin(lat),
        ]
    };
}