/**
 * Created by kras on 17.08.16.
 */
'use strict';

function GeoMetaRepository() {

  /**
   * Метод выполняет инициализацию репозитрия, осуществляя загрузку метаданных
   * возвращает обещание для передачи управления вызывающему коду
   *
   * @param {String} [parent] - опциональный код родительского узла
   * @returns {Promise}
   */
  this.init = function () {
    return this._init();
  };

  /**
   * Метод возвращает дочерние узлы для узла указанного в параметре parent
   * если parent не указан возвращает корневые узлы навигации
   *
   * @param {String} [parent] - опциональный код родительского узла
   * @param {String} [namespace] - пространство имен
   * @returns {NavigationNode[]}
   */
  this.getNavigationNodes = function (parent, namespace) {
    return this._getNavigationNodes(parent, namespace);
  };

  /**
   * Метод возвращает список секций навигации
   *
   * @param {String} [namespace] - пространство имен
   * @returns {NavigationSection[]}
   */
  this.getSections = function (namespace) {
    return this._getSections(namespace);
  };

  /**
   * Метод возвращает узел навигации соответствующий коду code
   *
   * @param {String} code - код узла
   * @param {String} [namespace] - пространство имен
   * @returns {NavigationNode | null}
   */
  this.getNavigationNode = function (code, namespace) {
    return this._getNavigationNode(code, namespace);
  };

  /**
   * Метод возвращает объект слоя гео-данных
   * @param {String} code - код запрашиваемого слоя
   * @param {String} [namespace] - пространство имен
   * @returns {Layer}
   */
  this.getLayer = function (code, namespace) {
    return this._getLayer(code, namespace);
  };
}

module.exports = GeoMetaRepository;
