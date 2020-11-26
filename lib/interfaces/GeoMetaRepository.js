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
<<<<<<< HEAD
   * @param {String} [namespace]
=======
   * @param {String} [namespace] - пространство имен
>>>>>>> russian
   * @returns {NavigationSection[]}
   */
  this.getSections = function (namespace) {
    return this._getSections(namespace);
  };

  /**
<<<<<<< HEAD
   * Method returns the navigation node corresponding to the code
   *
   * @param {String} code - node code
   * @param {String} [namespace]
=======
   * Метод возвращает узел навигации соответствующий коду code
   *
   * @param {String} code - код узла
   * @param {String} [namespace] - пространство имен
>>>>>>> russian
   * @returns {NavigationNode | null}
   */
  this.getNavigationNode = function (code, namespace) {
    return this._getNavigationNode(code, namespace);
  };

  /**
<<<<<<< HEAD
   * Method returns a geo-data layer object
   * @param {String} code - requested layer code
   * @param {String} [namespace]
=======
   * Метод возвращает объект слоя гео-данных
   * @param {String} code - код запрашиваемого слоя
   * @param {String} [namespace] - пространство имен
>>>>>>> russian
   * @returns {Layer}
   */
  this.getLayer = function (code, namespace) {
    return this._getLayer(code, namespace);
  };
}

module.exports = GeoMetaRepository;
