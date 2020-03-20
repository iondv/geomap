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
        warn(log, 'Не удалось прочитать директорию меты гео-слоев ' + src);
        resolve();
      })
      .then(readConfigFiles)
      .then(layers => {
        let promises = [];
        Object.keys(layers).forEach(fname => {
          let l = layers[fname];
          l.namespace = namespace;
          info(log, 'Слой гео-данных ' + l.code + ' будет записан в БД.');
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
        warn(log, 'Не удалось прочитать директорию меты навигации гео-модуля ' + src);
        resolve();
      })
      .then(readConfigFiles)
      .then(navs => {
        let promises = [];
        Object.keys(navs).forEach(fname => {
          let n = navs[fname];
          n.namespace = namespace;
          info(log, 'Узел навигации гео-данных ' + n.code + ' будет записан в БД.');
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
        warn(log, 'Не удалось прочитать директорию меты секций навигации гео-модуля ' + src);
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
          info(log, 'Секция навигации гео-данных ' + s.name + ' будет записана в БД.');
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
        info(scope.sysLog, 'Импорт меты гео-модуля из ' + pth);
        return layersLoader(pth, scope.geoMeta.dataSource, namespace, scope.sysLog)
          .then(
            function () {
              return navigationLoader(pth, scope.geoMeta.dataSource, namespace, scope.sysLog);
            }
          );
      }
    );
  };
