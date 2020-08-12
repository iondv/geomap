// jscs:disable requireCapitalizedComments
/**
 * Created by kras on 06.07.16.
 */
'use strict';

const path = require('path');
const express = require('express');
const staticRouter = require('lib/util/staticRouter');
const extViews = require('lib/util/extViews');
const theme = require('lib/util/theme');
const router = express.Router();
const ejsLocals = require('ejs-locals');

const di = require('core/di');
const config = require('./config');
const rootConfig = require('../../config');
const moduleName = require('./module-name');
const dispatcher = require('./dispatcher');
const extendDi = require('core/extendModuleDi');
const alias = require('core/scope-alias');
const errorSetup = require('core/error-setup');
const i18nSetup = require('core/i18n-setup');
const sysMenuCheck = require('lib/util/sysMenuCheck');
const strings = require('core/strings');
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
app.locals.s = strings.s;
app.locals.__ = (str, params) => strings.s(moduleName, str, params);

app.use('/' + moduleName, express.static(path.join(__dirname, 'view/static')));

app.engine('ejs', ejsLocals);
app.set('views', []);
app.set('view engine', 'ejs');

app._init = function () {
  return di(
      moduleName,
      extendDi(moduleName, config.di),
      {
        module: app
      },
      'app',
      [],
      'modules/' + moduleName)
    .then(scope => alias(scope, scope.settings.get(moduleName + '.di-alias')))
    .then((scope) => {
      try {
        const staticOptions = isProduction ? scope.settings.get('staticOptions') : undefined;
        // i18n
        const lang = config.lang || rootConfig.lang || 'ru';
        const i18nDir = path.join(__dirname, 'i18n');
        scope.translate.setup(lang, config.i18n || i18nDir, moduleName);

        let themePath = scope.settings.get(moduleName + '.theme') || config.theme || 'default';
        themePath = theme.resolve(__dirname, themePath);
        const themeI18n = path.join(themePath, 'i18n');
        scope.translate.setup(lang, themeI18n, moduleName);
        //
        theme(
          app,
          moduleName,
          __dirname,
          themePath,
          scope.sysLog,
          staticOptions
        );
        extViews(app, scope.settings.get(moduleName + '.templates'));
        var statics = staticRouter(scope.settings.get(moduleName + '.statics'), staticOptions);
        if (statics) {
          app.use('/' + moduleName, statics);
        }
        app.locals.pageTitle = scope.settings.get(moduleName + '.pageTitle')
          || scope.settings.get('pageTitle')
          || `ION ${config.sysTitle}`;
        app.locals.pageEndContent = scope.settings.get(moduleName +'.pageEndContent') || scope.settings.get('pageEndContent') || '';
        scope.auth.bindAuth(app, moduleName, {auth: false});
        app.get('/' + moduleName, lastVisit.saver, sysMenuCheck(scope, app, moduleName), dispatcher.index);
        app.use('/' + moduleName, router);
      } catch (err) {
        return Promise.reject(err);
      }
      return Promise.resolve();
    }
  );
};
