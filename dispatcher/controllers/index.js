/**
 * Created by kras on 24.05.16.
 */
'use strict';

var buildMenu = require('../../backend/menu').buildMenu;
var moduleName = require('../../module-name');
var di = require('core/di');

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
  var scope = di.context(moduleName);

  /**
   * @type {GeoMetaRepository}
   */
  var repo = scope.geoMeta;

  if (repo) {
    buildMenu(moduleName, scope, scope.auth.getUser(req).id())
      .then(function (menu) {
        res.render('view/index', {
          baseUrl: req.app.locals.baseUrl,
          module: moduleName,
          title: 'Geo module',
          pageCode: 'index',
          map: {
            start: scope.settings.get(moduleName + '.start'),
            zoom: scope.settings.get(moduleName + '.zoom'),
            regions: scope.settings.get(moduleName + '.regions'),
            search: scope.settings.get(moduleName + '.search'),
            stroke: scope.settings.get(moduleName + '.stroke'),
            formFilter: scope.settings.get(moduleName + '.formFilter'),
            panels: scope.settings.get(moduleName + '.panels'),
            legend: scope.settings.get(moduleName + '.legend'),
            ymapControls: scope.settings.get(moduleName + '.ymapControls')
          },
          defaultNode: defaultNode(scope.settings.get(moduleName + '.defaultNav')),
          leftMenu: menu,
          user: scope.auth.getUser(req),
          logo: scope.settings.get(moduleName + '.logo'),
          hidePageHead: scope.settings.get(moduleName + '.hidePageHead'),
          hidePageSidebar: scope.settings.get(moduleName + '.hidePageSidebar')
        });
      })
      .catch(function (err) {
        scope.sysLog.error(err);
        res.sendStatus(500);
      });
  } else {
    scope.sysLog.error(new Error('Geo-module metadata repository is not specified.'));
    res.sendStatus(500);
  }
};

