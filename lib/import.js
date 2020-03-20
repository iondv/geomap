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
const __ = require('core/strings').unprefix(moduleName);

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
      .catch(() => {
        warn(log, __('lib.failLayerDir', {src}));
        resolve();
      })
      .then(readConfigFiles)
      .then((layers) => {
        let promises = [];
        Object.keys(layers).forEach((fname) => {
          let l = layers[fname];
          l.namespace = namespace;
          info(log, __('lib.layerUpsert', {code: l.code}));
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
      .catch(() => {
        warn(log, __('lib.failNavDir', {src}));
        resolve();
      })
      .then(readConfigFiles)
      .then((navs) => {
        let promises = [];
        Object.keys(navs).forEach((fname) => {
          let n = navs[fname];
          n.namespace = namespace;
          info(log, __('lib.navUpsert', {code: n.code}));
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
      .catch(() => {
        warn(log, __('lib.failNavSectionDir', {src}));
        resolve();
      })
      .then(readConfigFiles)
      .then((sections) => {
        let promises = [];
        Object.keys(sections).forEach((fname) => {
          let s = sections[fname];
          s.section = true;
          s.name = fname;
          s.namespace = namespace;
          info(log, __('lib.navSectionUpsert', {name: s.name}));
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
        info(scope.sysLog, __('lib.importMeta', {pth}));
        return layersLoader(pth, scope.geoMeta.dataSource, namespace, scope.sysLog)
          .then(
            function () {
              return navigationLoader(pth, scope.geoMeta.dataSource, namespace, scope.sysLog);
            }
          );
      }
    );
  };
