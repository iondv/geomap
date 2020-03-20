/**
 * Created by krasilneg on 14.02.17.
 */
'use strict';

/**
 * Класс узла навигации
 * @param {{name:String, title:String}} base
 * @param {NavigationNode[]} base.nodes
 */
function NavigationSection(base) {
  this.base = base;

  this.getName = function () {
    return this.base.name;
  };

  this.getTitle = function () {
    return this.base.title;
  };

  this.getNamespace = function () {
    return this.base.namespace;
  };

  /**
   * Метод возвращает объекты дочерних узлов навигации
   * @returns {NavigationNode[]}
   */
  this.getNodes = function () {
    return this.base.nodes;
  };
}

module.exports = NavigationSection;
