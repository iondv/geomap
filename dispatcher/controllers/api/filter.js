'use strict';

const moduleName = require('../../../module-name');
const async = require('async');
const di = require('core/di');
const GLOBAL_NS = '__global';

module.exports = function (req, res) {
  let scope = di.context(moduleName);
  try {
    let ns = req.query.ns ? req.query.ns : GLOBAL_NS;
    let node = scope.geoMeta.getNavigationNode(req.query.code, ns);
    resolveFilter(node, scope, (err, data)=> {
      if (err) {
        scope.sysLog.error(err);
        return res.sendStatus(500);
      }
      res.json(data);
    });
  } catch (err) {
    scope.sysLog.error(err);
    res.sendStatus(500);
  }
};

function resolveFilter(node, scope, cb) {
  var filter = node.base.filter;
  if (!(filter instanceof Array)) {
    return cb(null, filter);
  }
  var fields = [];
  for (var i = 0; i < filter.length; ++i) {
    var group = filter[i];
    if (group.fields instanceof Array) {
      fields = fields.concat(group.fields);
    }
  }
  async.each(fields, (field, cb) => {
    var source = field.source;
    if (!source) {
      return cb(null);
    }
    scope.dataRepo.getList(source.className).then(items => {
      field.values = [];
      for (var  i = 0; i < items.length; ++i) {
        field.values.push({
          value: source.valueProp ? items[i].base[source.valueProp] : items[i].getItemId(),
          label: source.labelProp ? items[i].base[source.labelProp] : items[i].toString()
        });
      }
      cb();
    }).catch(cb);
  }, err => {
    cb(err, filter);
  });
}
