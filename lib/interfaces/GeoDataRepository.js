/**
 * Created by kras on 18.08.16.
 */
'use strict';

function GeoDataRepository() {
  /**
   * The method retrieves data from the specified source (REST or local data repository)
   * corresponding to the specified geographic area and source parameters
   * returns a promise to transfer control to the calling code.
   * Resolve-callback promise takes as input an array of objects of class Item.
   * @param {{x0: Number, y0: Number, x1: Number, y1: Number}} area - geographic area
   * @param {DataDescription} query
   * @param {{}} [options]
   * @returns {Promise}
   */
  this.getLayerData = function (area, query, options) {
    return this._getLayerData(area, query, options || {});
  };

  /**
   * @param {DataDescription} query
   * @param {String} id
   * @param {{}} [options]
   * @returns {Promise}
   */
  this.getLayerItem = function (query, id, options) {
    return this._getLayerItem(query, id, options || {});
  };

  /**
   * @param {DataDescription} query
   * @param {{}} criteria
   * @param {{}} [options]
   * @returns {Promise}
   */
  this.search = function (query, criteria, options) {
    return this._search(query, criteria, options || {});
  };
}

module.exports = GeoDataRepository;
