/**
 * Created by kras on 18.08.16.
 */
'use strict';

const path = require('path');
const di = require('core/di');
const config = require('../config');
const moduleName = require('../module-name');
const {processDirAsync, readConfigFiles} = require('core/util/read');
const F = require('core/FunctionCodes');

/**
 * @param {Logger} log
 * @param {String} msg
 */
function info(log, msg) {
  if (log) {
    log.log(msg);
  } else {
    console.log(msg);
  }
}

/**
 * @param {Logger} log
 * @param {String} msg
 */
function warn(log, msg) {
  if (log) {
    log.warn(msg);
  } else {
    console.warn(msg);
  }
}

/**
 * @param {String} src
 * @param {DataSource} dataSource
 * @param {String} namespace
 * @returns {*}
 */
function layersLoader(src, dataSource, namespace, log) {
  return new Promise(function (resolve, reject) {
    processDirAsync(path.join(src, 'layers'))
      .catch(e => {
        warn(log, 'Failed to read the geo-layer meta directory ' + src);
        resolve();
      })
      .then(readConfigFiles)
      .then(layers => {
        let promises = [];
        Object.keys(layers).forEach(fname => {
          let l = layers[fname];
          l.namespace = namespace;
          info(log, 'Geo-data layer ' + l.code + ' will be written to the database.');
          promises.push(
            dataSource.upsert(
              'ion_geo_layers',
              {
                [F.AND]: [
                  {[F.EQUAL]: ['$code', l.code]},
                  {[F.EQUAL]: ['$namespace', namespace]}
                ]
              }, l));
        });
        return Promise.all(promises);
      })
      .then(resolve)
      .catch(reject);
  });
}

/**
 * @param {String} src
 * @param {DataSource} dataSource
 * @param {String} namespace
 * @param {Logger} log
 * @returns {*}
 */
function navigationLoader(src, dataSource, namespace, log) {
  return new Promise(function (resolve, reject) {
    processDirAsync(path.join(src, 'navigation'))
      .catch(e => {
        warn(log, 'Failed to read the geo-module meta navigation directory ' + src);
        resolve();
      })
      .then(readConfigFiles)
      .then(navs => {
        let promises = [];
        Object.keys(navs).forEach(fname => {
          let n = navs[fname];
          n.namespace = namespace;
          info(log, 'Geo data navigation node ' + n.code + ' will be written to the database.');
          promises.push(dataSource.upsert(
            'ion_geo_nav',
            {
              [F.AND]: [
                {[F.EQUAL]: ['$code', n.code]},
                {[F.EQUAL]: ['$namespace', namespace]}
              ]
            }, n));
        });
        return Promise.all(promises);
      })
      .catch(reject)
      .then(() => processDirAsync(path.join(src, 'navigation', 'sections')))
      .catch(e => {
        warn(log, 'Failed to read the geo-module meta navigation section directory ' + src);
        resolve();
      })
      .then(readConfigFiles)
      .then(sections => {
        let promises = [];
        Object.keys(sections).forEach(fname => {
          let s = sections[fname];
          s.section = true;
          s.name = fname;
          s.namespace = namespace;
          info(log, 'Geo data navigation section ' + s.name + ' will be written to the database.');
          promises.push(dataSource.upsert(
            'ion_geo_nav',
            {
              [F.AND]: [
                {[F.EQUAL]: ['$name', s.name]},
                {[F.EQUAL]: ['$namespace', s.namespace]},
                {[F.EQUAL]: ['$section', true]}
              ]
            },
            s));
        });
        return Promise.all(promises);
      })
      .then(resolve)
      .catch(reject);
  });
}

module.exports = function (src, namespace) {
    return di(
      moduleName,
      config.di,
      {},
      'app',
      [],
      'modules/' + moduleName
    ).then(
      function (scope) {
        var pth = path.resolve(path.join(__dirname, '..', '..', '..'), src);
        info(scope.sysLog, 'Import a geo-module meta from ' + pth);
        return layersLoader(pth, scope.geoMeta.dataSource, namespace, scope.sysLog)
          .then(
            function () {
              return navigationLoader(pth, scope.geoMeta.dataSource, namespace, scope.sysLog);
            }
          );
      }
    );
  };
