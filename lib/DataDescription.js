/**
 * Created by kras on 18.08.16.
 */
'use strict';

/**
 * @param {{}} base
 * @param {Layer} layer
 * @constructor
 */
function DataDescription(base, layer, ind) {
  this.base = base;

  var _layer = layer;

  var _ind = ind;

  this.getType = function () {
    return this.base.type;
  };

  /**
   * @returns {Layer}
   */
  this.getLayer = function () {
    return _layer;
  };

  this.getIndex = function () {
    return _ind;
  };

  this.getOptions = function () {
    return this.base.options || {};
  };

  if (base.locationAttribute) {
    this.getLocationAttribute = function () {
      return this.base.locationAttribute;
    };
  } else if (base.coordType) {
    this.getCoordType = function () {
      return this.base.coordType;
    };
  }

  this.getMatchMode = function () {
    return this.base.matchMode || 'intersect';
  };

  if (typeof base.collection === 'string') {
    this.getCollection = function () {
      return this.base.collection;
    };
  }

  this.getNestedData = function () {
    if (!this.nested) {
      this.nested = [];
      for (var i = 0; i < this.base.nested.length; i++) {
        this.nested.push(new DataDescription(this.base.nested[i]));
      }
    }
    return this.nested;
  };

  if (typeof base.restUrl === 'string') {
    this.getRestUrl = function () {
      return this.base.restUrl;
    };
  } else if (typeof base.query === 'object') {
    this.getQuery = function () {
      return this.base.query;
    };
  }
}

module.exports = DataDescription;

module.exports.TYPE_POINT = 'point';
module.exports.TYPE_POLYLINE = 'polyline';
module.exports.TYPE_POLYGON = 'polygon';
module.exports.TYPE_AREA = 'area';
module.exports.MODE_WITHIN = 'within';
module.exports.MODE_INTERSECT = 'intersect';
