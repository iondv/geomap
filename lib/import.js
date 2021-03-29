/**
 * Created by kras on 18.08.16.
 */
'use strict';

const path = require('path');
const { di, utils: { strings, config: { processDirAsync, readConfigFiles }, system: { toAbsolute } } } = require('@iondv/core');
const { log: { IonLogger } } = require('@iondv/commons');
const moduleName = require('../module-name');
const { FunctionCodes: F } = require('@iondv/meta-model-contracts');
const __ = strings.unprefix(moduleName);

const fs = require('fs');

let config_file = process.env.ION_CONFIG_PATH || 'config';

config_file = path.isAbsolute(config_file)
  ? config_file
  : path.normalize(path.join(process.cwd(), config_file));

const config = fs.existsSync(config_file) ? require(config_file) : {};

const module_config = require('../config');

const { format } = require('util');

const sysLog = new IonLogger(config.log || {});

const extend = require('extend');

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
        warn(log, __('Failed to read the geo-layer meta directory %src', {src}));
        resolve();
      })
      .then(readConfigFiles)
      .then((layers) => {
        let promises = [];
        Object.keys(layers).forEach((fname) => {
          let l = layers[fname];
          l.namespace = namespace;
          info(log, __('Geo-data layer %code will be written to the database.', {code: l.code}));
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
        warn(log, __('Failed to read the geo-module meta navigation directory %src', {src}));
        resolve();
      })
      .then(readConfigFiles)
      .then((navs) => {
        let promises = [];
        Object.keys(navs).forEach((fname) => {
          let n = navs[fname];
          n.namespace = namespace;
          info(log, __('Geo data navigation node %code will be written to the database.', {code: n.code}));
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
        warn(log, __('Failed to read the geo-module meta navigation section directory %src', {src}));
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
          info(log, __('Geo data navigation section %name will be written to the database.', {name: s.name}));
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

module.exports = function (src, moduleName, namespace) {
    return di(
      'boot',
      extend(
        true,
        {
          settings: {
            module: '@iondv/commons/lib/settings/SettingsRepository',
            initMethod: 'init',
            initLevel: 1,
            options: {
              logger: 'ion://sysLog'
            }
          }
        },
        config.bootstrap || {}
      ),
      { sysLog }
    ).then(scope =>
      di(
        'app',
        extend(
          true,
          config.di,
          module_config.di,
          scope.settings.get('plugins') || {},
          scope.settings.get(`${moduleName}.di`) || {}
        ),
        {},
        'boot',
        ['geoMeta'],
        ['application']
      )
    ).then(
      (scope) => {
        src = toAbsolute(src);
        info(scope.sysLog, format(t('Importing geomap module meta from %s'), src));
        return layersLoader(src, scope.geoMeta.dataSource, namespace, scope.sysLog)
          .then(() => navigationLoader(src, scope.geoMeta.dataSource, namespace, scope.sysLog));
      }
    );
  };
