// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

const moduleName = require('../../module-name');
const di = require('core/di');
const moment = require('moment');
const __ = require('core/strings').unprefix('errors');
const Errors = require('../../errors/web-errors');

/* jshint maxstatements: 50, maxcomplexity: 30 */
module.exports = function (req, res) {
  /**
   * @type {{aclProvider: AclProvider, geoData: GeoDataRepository}}
   */
  const scope = di.context(moduleName);
  let user = scope.auth.getUser(req);
  let baseTemplate = req.query.template;
  let notFoundTemplate = req.query.notFound;
  let renderTemplate = function (template, data) {
    if (!template) {
      return res.sendStatus(404);
    }
    res.render(template, Object.assign({
      baseUrl: req.app.locals.baseUrl,
      moment
    }, data), (err, result) => {
      if (err) {
        scope.sysLog.error(err);
        return res.status(500).send(__(Errors.RENDER_FAIL, {template}));
      }
      return result ? res.send(result) : res.sendStatus(404);
    });
  };
  try {
    if (req.params.id) {
      let layer = scope.geoMeta.getLayer(req.params.layer, req.params.namespace);
      if (!layer) {
        return renderTemplate(notFoundTemplate, {req});
      }
      let query = layer.getData()[req.params.query || 0];
      scope.securedGeoData.getLayerItem(query, req.params.id, {user: user})
        .then(function (item) {
          renderTemplate(item ? baseTemplate : notFoundTemplate, {item, req});
        })
        .catch(function (err) {
          scope.sysLog.error(err);
          res.status(500).send(__(Errors.NO_LAYER));
        });
    } else {
      renderTemplate(notFoundTemplate, {req});
    }
  } catch (err) {
    scope.sysLog.error(err);
    res.sendStatus(500);
  }
};
