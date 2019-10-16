/**
 * Created by kras on 18.08.16.
 */
'use strict';

function GeoDataRepository() {
  /**
   * Метод выполняет получение данных из указанного источника (REST или локальный репозиторий данных)
   * соответствующие указанной географической области и параметрам источника
   * возвращает обещание для передачи управления вызывающему коду.
   * Resolve-колбэк обещания принимает на вход массив объектов класса Item.
   * @param {{x0: Number, y0: Number, x1: Number, y1: Number}} area - географическая область
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
