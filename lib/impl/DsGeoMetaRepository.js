/**
 * Created by kras on 17.08.16.
 */
'use strict';
// jshint maxstatements: 50, maxcomplexity: 30, maxdepth: 10
const GeoMetaRepository = require('../interfaces/GeoMetaRepository');
const Layer = require('../Layer');
const NavigationNode = require('../NavigationNode');
const NavigationSection = require('../NavigationSection');

function formNS(ns) {
  return 'ns_' + (ns ? ns : '');
}

/**
 * @param {{}} options
 * @param {DataSource} options.dataSource
 * @constructor
 */
function DsGeoMetaRepository(options) {

  var layers = {};

  var navigationRoots = {};

  var navigationList = {};

  var sections = {};

  this.dataSource = options.dataSource;

  this._init = function () {
    return new Promise(function (resolve, reject) {
      layers = {};

      navigationRoots = {};

      navigationList = {};

      sections = {};

      /**
       * @type {DataSource}
       */
      var ds = options.dataSource;
      ds.ensureIndex('ion_geo_layers', [{code: 1}], {unique: true}).
      then(function () {
        return ds.ensureIndex('ion_geo_nav', [{code: 1}], {unique: true});
      }).
      then(function () {
        return ds.fetch('ion_geo_layers');
      }).
      then(function (foundLayers) {
        var ns;
        for (var i = 0; i < foundLayers.length; i++) {
          ns = formNS(foundLayers[i].namespace);
          if (!layers.hasOwnProperty(ns)) {
            layers[ns] = {};
          }
          layers[ns][foundLayers[i].code] = new Layer(foundLayers[i]);
        }
        return ds.fetch('ion_geo_nav');
      }).
      then(function (foundNav) {
        var ns, c, i, j;
        for (i = 0; i < foundNav.length; i++) {
          ns = formNS(foundNav[i].namespace);
          if (foundNav[i].section) {
            if (!sections.hasOwnProperty(ns)) {
              sections[ns] = [];
            }
            sections[ns].push(foundNav[i]);
          } else {
            if (!navigationList.hasOwnProperty(ns)) {
              navigationList[ns] = {};
            }
            if (!navigationRoots.hasOwnProperty(ns)) {
              navigationRoots[ns] = [];
            }
            foundNav[i].subNodes = [];
            navigationList[ns][foundNav[i].code] = new NavigationNode(foundNav[i]);
          }
        }

        for (ns in navigationList) {
          if (navigationList.hasOwnProperty(ns)) {
            for (var code in navigationList[ns]) {
              if (navigationList[ns].hasOwnProperty(code)) {
                c = navigationList[ns][code];
                if (c.base.parent) {
                  if (navigationList[ns].hasOwnProperty(c.base.parent)) {
                    navigationList[ns][c.base.parent].base.subNodes.push(c);
                    c.base.parent = navigationList[ns][c.base.parent];
                  }
                } else {
                  navigationRoots[ns].push(navigationList[ns][code]);
                }
              }
            }
          }
        }

        var nodes, k;
        for (ns in sections) {
          if (sections.hasOwnProperty(ns)) {
            for (i = 0; i < sections[ns].length; i++) {
              nodes = [];
              if (navigationList.hasOwnProperty(ns)) {
                for (j = 0; j < sections[ns][i].nodes.length; j++) {
                  if (navigationList[ns].hasOwnProperty(sections[ns][i].nodes[j])) {
                    nodes.push(navigationList[ns][sections[ns][i].nodes[j]]);
                    if (navigationRoots.hasOwnProperty(ns)) {
                      k = navigationRoots[ns].indexOf(navigationList[ns][sections[ns][i].nodes[j]]);
                      if (k >= 0) {
                        navigationRoots[ns].splice(k, 1);
                      }
                    }
                  }
                }
              }
              sections[ns][i].nodes = nodes;
              sections[ns][i] = new NavigationSection(sections[ns][i]);
            }
          }
        }
        resolve();
      }).
      catch(reject);
    });
  };

  /**
   * Method returns a list of navigation sections
   *
   * @param {String} [namespace] - namespace
   * @returns {NavigationSection[]}
   */
  this._getSections = function (namespace) {
    var ns = formNS(namespace);
    if (sections.hasOwnProperty(ns)) {
      return sections[ns];
    }
    return [];
  };

  this._getNavigationNodes = function (parent, namespace) {
    var ns = formNS(namespace);
    if (navigationList.hasOwnProperty(ns)) {
      if (parent) {
        if (navigationList[ns].hasOwnProperty(parent)) {
          return navigationList[ns][parent].getSubNodes();
        }
        return [];
      }
      return navigationRoots[ns];
    }
    return [];
  };

  /**
   * Method returns the navigation node corresponding to the code
   *
   * @param {String} code - node code
   * @param {String} [namespace] - namespace
   * @returns {NavigationNode | null}
   */
  this._getNavigationNode = function (code, namespace) {
    var ns = formNS(namespace);
    if (navigationList.hasOwnProperty(ns)) {
      if (navigationList[ns].hasOwnProperty(code)) {
        return navigationList[ns][code];
      }
    }
    return null;
  };

  this._getLayer = function (code, namespace) {
    var ns = formNS(namespace);
    if (layers.hasOwnProperty(ns)) {
      if (layers[ns].hasOwnProperty(code)) {
        return layers[ns][code];
      }
    }
    return null;
  };
}

DsGeoMetaRepository.prototype = new GeoMetaRepository();

module.exports = DsGeoMetaRepository;
