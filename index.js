// jscs:disable requireCapitalizedComments
/**
 * Created by kras on 06.07.16.
 */
'use strict';

const path = require('path');
const express = require('express');
const {
  util: {
    staticRouter, extViews, theme
  }
} = require('@iondv/web');
const router = express.Router();
const ejsLocals = require('ejs-locals');

const {load} = require('@iondv/i18n');
const { di, utils: { strings } } = require('@iondv/core');
const config = require('./config');
const rootConfig = require('../../config');
const moduleName = require('./module-name');
const dispatcher = require('./dispatcher');
const { utils: { extendDi } } = require('@iondv/commons');
const alias = di.alias;
const sysMenuCheck = require('@iondv/web-rte/util/sysMenuCheck');
const isProduction = process.env.NODE_ENV === 'production';

const lastVisit = require('lib/last-visit');

router.get('/api/filter', dispatcher.api.filter);
router.get('/api/regions', dispatcher.api.regions);
router.get('/api/search', dispatcher.api.search);
router.get('/api/object/:class/:id', dispatcher.api.object);

router.get('/render/:namespace/:layer/:query/:id', dispatcher.render);
router.get('/render/:namespace/:layer', dispatcher.render);
router.post('/render/:namespace/:layer/:query', dispatcher.renderList);

router.get('/:node/layers', dispatcher.layers);
router.get('/:namespace/:node/layers', dispatcher.layers);

router.get('/:layer/objects', dispatcher.fetch);
router.get('/:namespace/:layer/objects', dispatcher.fetch);
router.get('/api/:class/:attr', dispatcher.api.fetch);

router.get('/:layer/objects/:index', dispatcher.fetch);
router.get('/:namespace/:layer/objects/:index', dispatcher.fetch);

var app = express();
module.exports = app;

app.locals.sysTitle = config.sysTitle;
app.locals.staticsSuffix = process.env.ION_ENV === 'production' ? '.min' : '';
// app.locals.s = strings.s;
// app.locals.__ = (str, params) => strings.s(moduleName, str, params);

app.engine('ejs', ejsLocals);
app.set('views', []);
app.set('view engine', 'ejs');

app._init = function (moduleName) {
  return load(path.join(process.cwd(), 'i18n'))
    .then(
      () => di(
        moduleName,
        extendDi(moduleName, config.di),
        {
          module: app
        },
        'app'
      )
    )
    .then(scope => alias(scope, scope.settings.get(moduleName + '.di-alias')))
    .then((scope) => {
      try {
        const staticOptions = isProduction ? scope.settings.get('staticOptions') : undefined;

        let themePath = scope.settings.get(moduleName + '.theme') || config.theme || 'default';
        themePath = theme.resolve(__dirname, themePath);
        const themeI18n = path.join(themePath, 'i18n');
        //
        theme(
          app,
          null,
          __dirname,
          themePath,
          scope.sysLog,
          staticOptions
        );
        extViews(app, scope.settings.get(moduleName + '.templates'));
        var statics = staticRouter(scope.settings.get(moduleName + '.statics'), staticOptions);
        if (statics) {
          app.use('/', statics);
        }
        app.locals.pageTitle = scope.settings.get(moduleName + '.pageTitle')
          || scope.settings.get('pageTitle')
          || `ION ${config.sysTitle}`;
        app.locals.pageEndContent = scope.settings.get(moduleName +'.pageEndContent') || scope.settings.get('pageEndContent') || '';
        scope.auth.bindAuth(app, '', {auth: false});
        app.get('/', lastVisit.saver, sysMenuCheck(scope, app, moduleName), dispatcher.index);
        app.use('/', router);
      } catch (err) {
        return Promise.reject(err);
      }
      return Promise.resolve();
    }
  );
};
