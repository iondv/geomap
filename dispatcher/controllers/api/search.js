'use strict';

const async = require('async');
const locale = require('locale');
const { di } = require('@iondv/core');
const searchFilter = require('core/interfaces/DataRepository/lib/util').textSearchFilter;
const { PropertyTypes } = require('@iondv/meta-model-contracts');

const GLOBAL_NS = '__global';

// jshint maxstatements: 30

module.exports = function (req, res) {
  /**
   * @type {{aclProvider: AclProvider}}
   */
  let scope = di.context(req.moduleName);
  let user = scope.auth.getUser(req);
  let locales = new locale.Locales(req.headers['accept-language']);
  let codes = req.query.codes || [];
  try {
    let datasets = [];
    for (let code of codes) {
      code = code.split('@');
      let node = scope.geoMeta.getNavigationNode(code[0], code[1] || GLOBAL_NS);
      if (node && node.getLayers() instanceof Array) {
        for (let layer of node.getLayers()) {
          layer = scope.geoMeta.getLayer(layer, node.getNamespace());
          if (layer && layer.getData() instanceof Array) {
            let data = layer.getData();
            for (let i = 0; i < data.length; i++) {
              datasets.push({data: data[i], ind: i});
            }
          }
        }
      }
    }

    async.eachSeries(datasets, (dataset, cb)=> {
      if (!dataset.data.getQuery) {
        return cb();
      }
      getList(dataset.data).then(result => {
        dataset.items = result;
        cb();
      }).catch(function (err) {
        scope.sysLog.error(err);
        cb();
      });
    }, err => {
      if (err) {
        scope.sysLog.error(err);
        return res.sendStatus(500);
      }
      let result = [];
      for (let dataset of datasets) {
        let attr = dataset.data.getLocationAttribute ? dataset.data.getLocationAttribute() : null;
        if (dataset.items) {
          for (let item of dataset.items) {
            let coords = attr ? item.get(attr) : item.coords;
            if (coords) {
              result.push({
                id: item.getItemId(),
                label: item.toString(),
                geometry: coords
              });
            }
          }
        }
      }
      res.json(result);
    });
  } catch (err) {
    scope.sysLog.error(err);
    res.sendStatus(500);
  }

  /**
   * @param {DataDescription} query
   * @returns {Promise}
   */
  function getList(query) {
    if (req.query.value) {
      if (typeof query.getQuery === 'function') {
        let cm = scope.metaRepo.getMeta(query.getQuery().className);
        let lang = locales[0] ? locales[0].language : 'ru';
        let searchAttrs = [];
        cm.getPropertyMetas().forEach(function (pm) {
          if (
            pm.type === PropertyTypes.STRING ||
            pm.type === PropertyTypes.TEXT ||
            pm.type === PropertyTypes.REFERENCE) {
            searchAttrs.push(pm.name);
          }
        });
        return searchFilter(scope, cm, {searchBy: searchAttrs}, req.query.value, lang, true, null, 1)
          .then((filter)=>scope.securedGeoData.search(query, filter, {user: user}));
      } else {
        return scope.securedGeoData.search(query, req.query.value, {user: user});
      }
    }
    return Promise.resolve([]);
  }
};
