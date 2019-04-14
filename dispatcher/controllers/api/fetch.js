'use strict';

var moduleName = require('../../../module-name');
var di = require('core/di');
var clone = require('clone');
var DataDescription = require('../../../lib/DataDescription');

function mergeProperties(result, cm) {
  Array.prototype.push.apply(result.properties, cm.plain.properties);
  var anc = cm.getAncestor();
  if (anc) {
    mergeProperties(result, anc);
  }
}

module.exports = function (req, res) {
  var scope = di.context(moduleName);
  scope.geoData.getLayerData({}, new DataDescription({
    locationAttribute: req.params.attr,
    query: {
      className: req.params.class
    }
  })).then(function (list) {
    var result = {
      meta: [],
      items: []
    };
    var metas = {};
    var tmp;
    for (var i = 0; i < list.length; i++) {
      if (!metas.hasOwnProperty(list[i].getMetaClass().getCanonicalName())) {
        metas[list[i].getMetaClass().getCanonicalName()] = true;
        tmp = clone(list[i].getMetaClass().plain);
        if (list[i].getMetaClass().getAncestor()) {
          mergeProperties(tmp, list[i].getMetaClass().getAncestor());
        }
        result.meta.push(tmp);
      }
      result.items.push(list[i].base);
    }
    res.send(result);
  }).catch(function (err) {
    scope.sysLog.error(err);
    res.sendStatus(500);
  });
};
