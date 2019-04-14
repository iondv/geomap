// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/**
 * Created by kras on 24.05.16.
 */
'use strict';

const moduleName = require('../../module-name');
const di = require('core/di');
const cuid = require('cuid');
const normalize = require('core/util/normalize');
const moment = require('moment');
const locale = require('locale');

/* jshint maxstatements: 50, maxcomplexity: 30, maxparams: 7 */
function assignFeature(props) {
  return function (feature) {
    if (typeof feature.id === 'undefined' || feature.id === null) {
      feature.id = cuid();
    }
    if (props) {
      if (!feature.properties) {
        feature.properties = {};
      }
      Object.assign(feature.properties, props);
    }
  };
}

function dateSerializer(lang) {
  return function (date) {
    var dt = moment(date);
    if (lang) {
      dt.locale(lang);
    }
    return dt.format('L LT');
  };
}

function fetcher(scope, area, dataDescriptor, features, opts) {
  return function () {
    return scope.securedGeoData.getLayerData(
      {
        x0: parseFloat(area[0]),
        y0: parseFloat(area[1]),
        x1: parseFloat(area[2]),
        y1: parseFloat(area[3])
      }, dataDescriptor, {
        user: opts.user,
        requestEagerLoadingProps: opts.requestEagerLoadingProps
      })
      .then(function (results) {
        try {
          for (let i = 0; i < results.length; i++) {
            let la = typeof dataDescriptor.getLocationAttribute === 'function' ?
              dataDescriptor.getLocationAttribute() : false;
            let tmp = la ? results[i].get(la) : results[i].coord;
            let item = normalize(
              results[i],
              dateSerializer(opts.lang),
              {greedy: false}
            );
            if (la) {
              delete item[la];
            }
            let props = {
              item: item,
              itemId: results[i].getItemId()
            };
            if (tmp) {
              if (tmp.type === 'Feature') {
                assignFeature(props)(tmp);
                features.push(tmp);
              } else if (tmp.type === 'FeatureCollection') {
                tmp.features.forEach(assignFeature(props));
                Array.prototype.push.apply(features, tmp.features);
              } else {
                features.push({
                  type: 'Feature',
                  id: results[i].getItemId(),
                  geometry: tmp,
                  properties: Object.assign({
                    balloonContent: results[i].toString()
                  }, props)
                });
              }
            }
          }
        } catch (err) {
          if (opts.log) {
            opts.log.error(err);
          }
        }
        return Promise.resolve();
      })
      .catch(function (err) {
        if (opts.log) {
          opts.log.error(err);
        }
        return Promise.resolve();
      });
  };
}

function parseEagerLoadingProps (data) {
  let result = {};
  if (data && typeof data === 'string') {
    for (let item of data.split(',')) {
      let parts = item.split(':');
      if (result[parts[0]]) {
        result[parts[0]].push(parts[1]);
      } else {
        result[parts[0]] = [parts[1]];
      }
    }
  }
  return result;
}

module.exports = function (req, res) {
  /**
   * @type {{geoMeta: GeoMetaRepository, securedGeoData: SecuredGeoDataRepository, aclProvider: AclProvider}}
   */
  let scope = di.context(moduleName);
  let user = scope.auth.getUser(req);
  let layer = scope.geoMeta.getLayer(req.params.layer, req.params.namespace);
  if (!layer) {
    res.sendStatus(404);
    return;
  }
  let locales = new locale.Locales(req.headers['accept-language']);
  let area = req.query.bbox.split(',');
  let dataDescriptors;
  dataDescriptors = layer.getData();
  if (req.params.index) {
    dataDescriptors = [dataDescriptors[parseInt(req.params.index)]];
  }
  let requestEagerLoadingProps = parseEagerLoadingProps(req.query.eager);
  let fetchers = null;
  let list = {
    type: 'FeatureCollection',
    features: []
  };
  for (let i = 0; i < dataDescriptors.length; i++) {
    if (fetchers) {
      fetchers = fetchers
        .then(fetcher(
          scope,
          area,
          dataDescriptors[i],
          list.features,
          {
            user: user,
            log: scope.sysLog,
            lang: locales[0] ? locales[0].language : 'ru',
            requestEagerLoadingProps
          }));
    } else {
      fetchers = fetcher(
        scope,
        area,
        dataDescriptors[i],
        list.features,
        {
          user: user,
          log: scope.sysLog,
          lang: locales[0] ? locales[0].language : 'ru',
          requestEagerLoadingProps
        })();
    }
  }
  if (!fetchers) {
    fetchers = Promise.resolve();
  }
  return fetchers.then(()=> {
      res.send(req.query.callback + '(' + JSON.stringify(list) + ')');
  }).catch(err => {
      scope.sysLog.error(err);
      res.sendStatus(500);
  });
};
