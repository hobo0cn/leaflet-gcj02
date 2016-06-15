/**
 * Projection class for Baidu Spherical Mercator
 *
 * @class BaiduSphericalMercator
 */
L.Projection.GCJ02SphericalMercator = {
    /**
     * Project latLng to point coordinate
     *
     * @method project
     * @param {Object} latLng coordinate for a point on earth
     * @return {Object} leafletPoint point coordinate of L.Point
     */
    project: function(latLng) {
        //1.gcj02 to wgs84 lat lon
        //2.wgs84 lat lon to point
        var wgs84_latlon = gcj2wgs(latLng.lat, latLng.lng)
        // var MAX_LATITUDE = 85.0511287798;
        // var R = 6378137;
        // var d = Math.PI/ 180;
        // var max = MAX_LATITUDE;
        // var lat = Math.max(Math.min(max, wgs84_latlon.lat), -max);
        // var sin = Math.sin(lat * d);

        // var x = R *  wgs84_latlon.lng * d;
        // var y = R * Math.log((1 + sin) / (1 - sin)) / 2;

        var x = wgs84_latlon.lng * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + wgs84_latlon.lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        
        var leafletPoint = new L.Point(x, y);
        return leafletPoint;

    },

    /**
     * unproject point coordinate to latLng
     *
     * @method unproject
     * @param {Object} bpoint baidu point coordinate
     * @return {Object} latitude and longitude
     */
    unproject: function (bpoint) {
        //1. x,y to wgs84 lat lon
        //2. wgs84 to gcj02 lat lon
        // var R = 6378137;
        // var d = 180 / Math.PI;
        // var lng = bpoint.x * d / R;
        // var lat = (2 * Math.atan(Math.exp(bpoint.y / R)) - (Math.PI / 2)) * d;

        var lng = (bpoint.x / 20037508.34) * 180;
        var lat = (bpoint.y / 20037508.34) * 180;

        lat = 180/Math.PI * (2 * Math.atan(Math.Exp(lat * Math.PI / 180)) - Math.PI / 2);

        gcj02_latlon = wgs2gcj(lat, lng);
        var latLng = new L.LatLng(gcj02_latlon.lat, gcj02_latlon.lng);
        return latLng;
    },

    /**
     * Don't know how it used currently.
     *
     * However, I guess this is the range of coordinate.
     * Range of pixel coordinate is gotten from
     * BMap.MercatorProjection.lngLatToPoint(180, -90) and (180, 90)
     * After getting max min value of pixel coordinate, use
     * pointToLngLat() get the max lat and Lng.
     */
    // bounds: (function () {
    //     var MAX_X= 20037726.37;
    //     var MIN_Y= -11708041.66;
    //     var MAX_Y= 12474104.17;
    //     var bounds = L.bounds(
    //         [-MAX_X, MIN_Y], //180, -71.988531
    //         [MAX_X, MAX_Y]  //-180, 74.000022
    //     );
    //     return bounds;
    // })()
};

/**
 * Transformation class for Baidu Transformation.
 * Basically, it contains the conversion of point coordinate and
 * pixel coordinate.
 *
 * @class BTransformation
 */
L.GCJ02Transformation = function () {
};

L.GCJ02Transformation.prototype = {
    MAXZOOM: 30,
    /**
     * Don't know how it used currently.
     */
    transform: function (point, zoom) {
        return this._transform(point.clone(), zoom);
    },

    /**
     * transform point coordinate to pixel coordinate
     *
     * @method _transform
     * @param {Object} point point coordinate
     * @param {Number} zoom zoom level of the map
     * @return {Object} point, pixel coordinate
     */
    _transform: function (point, zoom) {
        point.x = point.x >> (this.MAXZOOM - zoom);
        point.y = point.y >> (this.MAXZOOM - zoom);
        return point;
    },

    /**
     * transform pixel coordinate to point coordinate
     *
     * @method untransform
     * @param {Object} point pixel coordinate
     * @param {Number} zoom zoom level of the map
     * @return {Object} point, point coordinate
     */
    untransform: function (point, zoom) {
        point.x = point.x << (this.MAXZOOM - zoom);
        point.y = point.y << (this.MAXZOOM - zoom);
        return point;
    }
};

/**
 * Coordinate system for Baidu EPSG3857
 *
 * @class BEPSG3857
 */
L.CRS.GCJ02 = L.extend({}, L.CRS, {
    /**
     * transform latLng to pixel coordinate
     *
     * @method untransform
     * @param {Object} latlng latitude and longitude
     * @param {Number} zoom zoom level of the map
     * @return {Object} pixel coordinate calculated for latLng
     */
    latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
        var projectedPoint = this.projection.project(latlng);
        return this.transformation._transform(projectedPoint, zoom);
    },

    /**
     * transform pixel coordinate to latLng
     *
     * @method untransform
     * @param {Object} point pixel coordinate
     * @param {Number} zoom zoom level of the map
     * @return {Object} latitude and longitude
     */
    pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
        var untransformedPoint = this.transformation.untransform(point, zoom);
        return this.projection.unproject(untransformedPoint);
    },

    code: 'EPSG:3857',
    projection: L.Projection.GCJ02SphericalMercator,

    transformation: new L.GCJ02Transformation()
});
