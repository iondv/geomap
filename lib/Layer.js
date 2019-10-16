/**
 * Created by kras on 18.08.16.
 */
'use strict';

var DataDescription = require('./DataDescription');

/**
 * Класс слоя гео-данных
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
   * Метод возвращает объекты мета-описания запросов гео-данных
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
