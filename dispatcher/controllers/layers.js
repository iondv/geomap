/**
 * Created by kras on 20.08.16.
 */
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

const { di } = require('@iondv/core');
const { Permissions } = require('@iondv/acl-contracts');

/* jshint maxstatements: 50, maxcomplexity: 30 */
module.exports = function (req, res) {
  /**
   * @type {{geoMeta: GeoMetaRepository, securedGeoData: SecuredGeoDataRepository, aclProvider: AclProvider}}
   */
  var scope = di.context(req.moduleName);

  var n = scope.geoMeta.getNavigationNode(req.params.node, req.params.namespace);
  if (!n) {
    res.sendStatus(404);
    return;
  }

  var layers = n.getLayers();
  var resources = [];

  var user = scope.auth.getUser(req);
  if (Array.isArray(layers)) {
    let ls = [];
    for (var i = 0; i < layers.length; i++) {
      let l = scope.geoMeta.getLayer(layers[i], n.getNamespace());
      if (l) {
        resources.push(scope.securedGeoData.layerAclId(l));
        let dd = l.getData();
        for (let j = 0; j < dd.length; j++) {
          resources.push(scope.securedGeoData.dataAclId(dd[j]));
        }
        ls.push(l);
      }
    }

    scope.aclProvider.getPermissions(user.id(), resources)
      .then(function (permissions) {
        var result = [];
        for (let i = 0; i < ls.length; i++) {
          let laid = scope.securedGeoData.layerAclId(ls[i]);
          let accessible = permissions[laid] && permissions[laid][Permissions.READ];
          if (!accessible) {
            let dd = ls[i].getData();
            for (let j = 0; j < dd.length; j++) {
              let daid = scope.securedGeoData.dataAclId(dd[j]);
              if (permissions[daid] && permissions[daid][Permissions.READ]) {
                accessible = true;
                break;
              }
            }
          }
          if (accessible) {
            result.push(ls[i].base);
          }
        }
        if (!result.length) {
          res.sendStatus(403);
        }
        res.send(result);
      })
      .catch(function (err) {
        scope.sysLog.error(err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(404);
  }
};
