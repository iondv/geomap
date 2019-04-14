/**
 * Created by kras on 18.08.16.
 */
'use strict';

/**
 * Navigation node class
 * @param {{type:String, code:String, caption:String, hint:String, layers:String[]}} base
 * @param {NavigationNode} base.parent
 * @param {NavigationNode[]} base.subNodes
 */
function NavigationNode(base) {
  this.base = base;

  this.getType = function () {
    return this.base.type;
  };

  this.getCode = function () {
    return this.base.code;
  };

  this.getCaption = function () {
    return this.base.caption;
  };

  this.getHint = function () {
    return this.base.hint;
  };

  this.getNamespace = function () {
    return this.base.namespace;
  };

  this.getLayers = function () {
    return this.base.layers || [];
  };

  /**
   * Method returns the object of the parent navigation node
   * @returns {NavigationNode}
   */
  this.getParent = function () {
    return this.base.parent;
  };

  /**
   * Method returns the objects of the child navigation nodes
   * @returns {NavigationNode[]}
   */
  this.getSubNodes = function () {
    return this.base.subNodes || [];
  };
}

module.exports = NavigationNode;
