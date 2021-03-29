/**
 * Created by kras on 18.08.16.
 */
'use strict';

const GLOBAL_NS = '__global';
const crossNav = require('@iondv/web-rte/util/crossNav');
const access = require('../lib/access');
const { Permissions } = require('@iondv/acl-contracts');

/* jshint maxcomplexity: 25, maxstatements: 50, maxdepth: 11 */
/**
 * @param {NavigationNode[]} nodes
 * @param {{}} permissions
 * @param {GeoMetaRepository} metaRepo
 * @param {SecuredGeoDataRepository} sDataRepo
 * @returns {Array}
 */
function buildSubMenu(nodes, permissions, metaRepo, sDataRepo) {
  var i;
  var result = [];
  for (i = 0; i < nodes.length; i++) {
    let type = nodes[i].base.type;
    let url = nodes[i].base.url;
    let accessible = false;
    let subnodes = buildSubMenu(nodes[i].getSubNodes(), permissions, metaRepo, sDataRepo);
    accessible = subnodes.length > 0;
    if (url) {
      let naid = access.nodeAclId(nodes[i]);
      accessible = accessible || permissions[naid] && permissions[naid][Permissions.READ];
    } else if (type === 'data') {
      url = (nodes[i].getNamespace() ? nodes[i].getNamespace() + '/' : '') + nodes[i].getCode() + '/layers';
      if (!accessible) {
        let layers = nodes[i].getLayers();
        for (let j = 0; j < layers.length; j++) {
          let l = metaRepo.getLayer(layers[j], nodes[i].getNamespace());
          if (l) {
            if (permissions[sDataRepo.layerAclId(l)] && permissions[sDataRepo.layerAclId(l)][Permissions.READ]) {
              accessible = true;
              break;
            } else {
              let d = l.getData();
              for (let k = 0; k < d.length; k++) {
                if (
                  permissions[sDataRepo.dataAclId(d[k])] &&
                  permissions[sDataRepo.dataAclId(d[k])][Permissions.READ]
                ) {
                  accessible = true;
                  break;
                }
              }
              if (accessible) {
                break;
              }
            }
          }
        }
      }
    }
    if (accessible) {
      result.push({
        id: nodes[i].getNamespace() + '@' + nodes[i].getCode(),
        nodes: subnodes,
        hint: nodes[i].getHint(),
        caption: nodes[i].getCaption(),
        url,
        external: false,
        orderNumber: nodes[i].base.order,
        hasFilter: nodes[i].base.filter ? true : false,
        viewer: nodes[i].base.viewer,
        code: nodes[i].base.code,
        ns: nodes[i].base.namespace,
        type,
        icon: nodes[i].base.icon
      });
    }
  }
  orderMenu(result);
  return result;
}

function processCrossNodes(nodes, level, panel) {
  let result = [];
  nodes.forEach((n)=> {
    result.push({
      isSection: level === 0,
      panel: level === 0 ? panel : null,
      id: n.id,
      caption: n.caption,
      hint: n.hint,
      url: n.url,
      external: n.external,
      nodes: Array.isArray(n.subnodes) ? processCrossNodes(n.subnodes, level + 1) : []
    });
  });
  return result;
}

/**
 * @param {Array} nodes
 * @param {Array} resources
 * @param {GeoMetaRepository} geoMeta
 * @param {SecuredGeoDataRepository} sDataRepo
 */
function calcResources(nodes, resources, geoMeta, sDataRepo) {
  for (let i = 0; i < nodes.length; i++) {
    resources.push(access.nodeAclId(nodes[i]));
    let layers = nodes[i].getLayers();
    if (Array.isArray(layers)) {
      for (let j = 0; j < layers.length; j++) {
        let l = geoMeta.getLayer(layers[j], nodes[i].getNamespace());
        if (l) {
          resources.push(sDataRepo.layerAclId(l));
          let data = l.getData();
          if (Array.isArray(data)) {
            for (let k = 0; k < data.length; k++) {
              resources.push(sDataRepo.dataAclId(data[k]));
            }
          }
        }
      }
    }
    calcResources(nodes[i].getSubNodes(), resources, geoMeta, sDataRepo);
  }
}

/**
 * @param {String} moduleName
 * @param {{}} scope
 * @param {SettingsRepository} scope.settings
 * @param {GeoMetaRepository} scope.geoMeta
 * @param {SecuredGeoDataRepository} scope.securedGeoData
 * @param {AclProvider} scope.aclProvider
 * @returns {Promise}
 */
module.exports.buildMenu = function (moduleName, scope, uid) {
  let namespaces = scope.settings.get(moduleName + '.namespaces') || {};
  let resources = [];

  if (!namespaces.hasOwnProperty(GLOBAL_NS)) {
    namespaces[GLOBAL_NS] = '';
  }

  for (let nm in namespaces) {
    if (namespaces.hasOwnProperty(nm)) {
      let roots = scope.geoMeta.getNavigationNodes(null, nm === GLOBAL_NS ? null : nm);
      let sections = scope.geoMeta.getSections(nm === GLOBAL_NS ? null : nm);
      if (roots.length > 0 || sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          calcResources(sections[i].getNodes(), resources, scope.geoMeta, scope.securedGeoData);
        }
        calcResources(roots, resources, scope.geoMeta, scope.securedGeoData);
      }
    }
  }

  return scope.aclProvider.getPermissions(uid, resources)
    .then(function (permissions) {
      var icons = scope.settings.get(moduleName + '.icons') || {};
      var result = [];
      for (let nm in namespaces) {
        if (namespaces.hasOwnProperty(nm)) {
          let roots = scope.geoMeta.getNavigationNodes(null, nm === GLOBAL_NS ? null : nm);
          let sections = scope.geoMeta.getSections(nm === GLOBAL_NS ? null : nm);
          if (roots.length > 0 || sections.length > 0) {
            let nodes = [];
            for (let i = 0; i < sections.length; i++) {
              let subs = buildSubMenu(sections[i].getNodes(), permissions, scope.geoMeta, scope.securedGeoData);
              if (subs.length) {
                nodes.push({
                  isSection: true,
                  template: sections[i].base.template,
                  panel: sections[i].base.panel,
                  id: sections[i].getName(),
                  nodes: subs,
                  hint: sections[i].getTitle(),
                  caption: sections[i].getTitle(),
                  url: '',
                  external: false,
                  icon: sections[i].base.icon
                });
              }
            }
            let subs = nodes.concat(buildSubMenu(roots, permissions, scope.geoMeta, scope.securedGeoData));
            if (subs.length) {
              result.push({
                id: nm,
                nodes: subs,
                hint: namespaces[nm],
                caption: namespaces[nm],
                url: '',
                external: false,
                icon: icons[nm]
              });
            }
          }
        }
      }

      let tmp = processCrossNodes(
        crossNav(moduleName, scope.metaRepo, scope.settings), 0, scope.settings.get(moduleName + '.crossNavPanel')
      );
      return Promise.resolve(result.concat(tmp));
    });
};

function orderMenu(nodes) {
  nodes.sort((a, b)=> {
    a = a.orderNumber;
    b = b.orderNumber;
    return a === undefined ? (b === undefined ? 0 : 1) : b === undefined ? -1 : a - b;
  });
}
