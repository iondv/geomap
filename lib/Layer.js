/**
 * Created by kras on 18.08.16.
 */
'use strict';

var DataDescription = require('./DataDescription');

/**
 * Geo-data layer class
 * @param {{ code: String, order: Number, caption: String, hint:String, data:Object[] }} base
 */
function Layer(base) {
  this.base = base;

  this.getCode = function () {return this.base.code;};
  this.getOrder = function () {return this.base.order;};
  this.getCaption = function () {return this.base.caption;};
  this.getHint = function () {return this.base.hint;};
  this.getNamespace = function () {return this.base.namespace;};

  /**
   * Method returns meta description objects for geo-data queries.
   * @returns {DataDescription[]}
   */
  this.getData = function () {
    if (!this.data) {
      this.data = [];

      if (this.base.data) {
        for (var i = 0; i < this.base.data.length; i++) {
          this.data.push(new DataDescription(this.base.data[i], this, i));
        }
      }
    }

    return this.data;
  };
}

module.exports = Layer;
