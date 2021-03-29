/**
 * Created by kras on 24.05.16.
 */
'use strict';

const buildMenu = require('../../backend/menu').buildMenu;
const Errors = require('../../errors/web-errors');
const { IonError } = require('@iondv/core');
const { di } = require('@iondv/core');

function defaultNode(nav) {
  var result = '';
  if (nav) {
    if (nav.namespace) {
      result += nav.namespace;
    }
    if (nav.node) {
      result += '@' + nav.node;
    }
  }
  return result;
}

module.exports = function (req, res) {
  /**
   * @type {{metaRepo: MetaRepository}}
   */
  var scope = di.context(req.moduleName);

  /**
   * @type {GeoMetaRepository}
   */
  var repo = scope.geoMeta;

  if (repo) {
    buildMenu(req.moduleName, scope, scope.auth.getUser(req).id())
      .then(function (menu) {
        res.render('view/index', {
          baseUrl: req.app.locals.baseUrl,
          module: req.moduleName,
          title: 'Geo module',
          pageCode: 'index',
          map: {
            start: scope.settings.get(req.moduleName + '.start'),
            zoom: scope.settings.get(req.moduleName + '.zoom'),
            regions: scope.settings.get(req.moduleName + '.regions'),
            search: scope.settings.get(req.moduleName + '.search'),
            stroke: scope.settings.get(req.moduleName + '.stroke'),
            formFilter: scope.settings.get(req.moduleName + '.formFilter'),
            panels: scope.settings.get(req.moduleName + '.panels'),
            legend: scope.settings.get(req.moduleName + '.legend'),
            ymapControls: scope.settings.get(req.moduleName + '.ymapControls')
          },
          defaultNode: defaultNode(scope.settings.get(req.moduleName + '.defaultNav')),
          leftMenu: menu,
          user: scope.auth.getUser(req),
          logo: scope.settings.get(req.moduleName + '.logo'),
          hidePageHead: scope.settings.get(req.moduleName + '.hidePageHead'),
          hidePageSidebar: scope.settings.get(req.moduleName + '.hidePageSidebar')
        });
      })
      .catch(function (err) {
        scope.sysLog.error(err);
        res.sendStatus(500);
      });
  } else {
    scope.sysLog.error(new IonError(Errors.NO_REPO));
    res.sendStatus(500);
  }
};

