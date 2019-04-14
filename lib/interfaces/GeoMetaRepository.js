/**
 * Created by kras on 17.08.16.
 */
'use strict';

function GeoMetaRepository() {

  /**
   * Method performs repository initialization., implementing metadata download
   * returns promise to transfer control to calling code
   *
   * @param {String} [parent] - optional parent node code
   * @returns {Promise}
   */
  this.init = function () {
    return this._init();
  };

  /**
   * Method returns the child nodes for the node specified in the parameter parent
   * if parent not specified, then returns root navigation nodes
   *
   * @param {String} [parent] - optional parent node code
   * @param {String} [namespace] - namespace
   * @returns {NavigationNode[]}
   */
  this.getNavigationNodes = function (parent, namespace) {
    return this._getNavigationNodes(parent, namespace);
  };

  /**
   * Method returns a list of navigation sections
   *
   * @param {String} [namespace] - namespace
   * @returns {NavigationSection[]}
   */
  this.getSections = function (namespace) {
    return this._getSections(namespace);
  };

  /**
   * Method returns the navigation node corresponding to the code code
   *
   * @param {String} code - Node code
   * @param {String} [namespace] - namespace
   * @returns {NavigationNode | null}
   */
  this.getNavigationNode = function (code, namespace) {
    return this._getNavigationNode(code, namespace);
  };

  /**
   * Method returns a geo-data layer object
   * @param {String} code - requested layer code
   * @param {String} [namespace] - namespace
   * @returns {Layer}
   */
  this.getLayer = function (code, namespace) {
    return this._getLayer(code, namespace);
  };
}

module.exports = GeoMetaRepository;
